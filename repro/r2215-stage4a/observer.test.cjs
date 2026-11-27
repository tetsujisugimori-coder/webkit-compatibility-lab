'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const {createObserver, readPublicState, installPublicEventAdapter} = require('./observer.cjs');
const fake = () => {
  let time = 0;
  const page = new EventEmitter(), browser = new EventEmitter();
  const observer = createObserver({clock: () => ++time, wallClock: () => 'fixed'});
  observer.attach(page, browser);
  return {observer, page, browser};
};
const request = (url, nav = true) => ({url: () => url, isNavigationRequest: () => nav,
  failure: () => ({errorText: 'failed'})});

test('public state distinguishes null, unsupported and read error', () => {
  const state = readPublicState({location: {href: 'http://localhost/'}, history: {length: 2},
    navigation: {currentEntry: null, entries() {throw new Error('unavailable');}}});
  assert.deepEqual(state.currentEntry, {status: 'OK', value: null});
  assert.equal(state.entriesLength.status, 'ERROR');
  assert.equal(state.activation.status, 'UNSUPPORTED');
  assert.equal(state.historyLength.value, 2);
  const absent = readPublicState({});
  assert.equal(absent.navigationAvailable.value, false);
  assert.equal(absent.currentEntry.status, 'UNSUPPORTED');
  assert.equal(absent.entriesLength.status, 'UNSUPPORTED');
  assert.equal(absent.activation.status, 'UNSUPPORTED');
});
test('public state reads entry and activation without changing them', () => {
  const e = Object.freeze({key: 'k', id: 'i', url: 'http://localhost/'});
  const navigation = Object.freeze({currentEntry: e, entries: () => [e], activation: {navigationType: 'reload', from: e}});
  const state = readPublicState({navigation});
  assert.deepEqual(state.currentEntry.value, e);
  assert.equal(state.entriesLength.value, 1);
  assert.deepEqual(state.activation.value, {navigationType: 'reload', from: e});
});
test('same URL requests are distinct, 200 is not body completion', () => {
  const {observer, page} = fake();
  const a = request('/same'), b = request('/same');
  observer.beginStep('reload');
  page.emit('request', a); page.emit('response', {request: () => a, status: () => 200});
  page.emit('request', b); page.emit('response', {request: () => b, status: () => 200});
  page.emit('requestfinished', b); page.emit('requestfailed', a);
  page.emit('requestfinished', request('/asset', false));
  observer.endStep();
  const events = observer.report();
  assert.deepEqual(events.filter(e => e.type.startsWith('http.')).map(e => [e.type, e.details.requestId]),
    [['http.request',1],['http.response',1],['http.request',2],['http.response',2],['http.request.finished',2],['http.request.failed',1]]);
  assert.deepEqual(events.map(e => e.seq), events.map((_,i) => i+1));
  assert.ok(events.every((e,i) => i === 0 || e.t_ms > events[i-1].t_ms));
});
test('snapshot success and exception are recorded independently', async () => {
  const {observer, page} = fake();
  page.evaluate = fn => fn({history: {length: 1}});
  assert.equal((await observer.snapshot(page, 'initial')).value.historyLength.value, 1);
  page.evaluate = () => {throw new Error('closed');};
  assert.equal((await observer.snapshot(page, 'later')).status, 'ERROR');
});
test('null and undefined read errors preserve other fields and release the snapshot', async () => {
  const {observer, page} = fake();
  for (const thrown of [null, undefined]) {
    const state = readPublicState({
      history: {length: 2},
      navigation: {get currentEntry() {throw thrown;}},
    });
    assert.deepEqual(state.historyLength, {status: 'OK', value: 2});
    assert.deepEqual(state.currentEntry, {status: 'ERROR', message: String(thrown)});

    page.evaluate = async () => {throw thrown;};
    const result = {status: 'ERROR', message: String(thrown)};
    assert.deepEqual(await observer.snapshot(page, 'read failure'), result);
    const last = observer.report().at(-1);
    assert.equal(last.type, 'snapshot.end');
    assert.deepEqual(last.details, {label: 'read failure', ...result});
  }
  page.evaluate = fn => fn({history: {length: 3}});
  assert.equal((await observer.snapshot(page, 'next')).value.historyLength.value, 3);
});
test('snapshot timeout stops further snapshots; late completion cannot append', async () => {
  const {observer, page} = fake();
  let complete;
  page.evaluate = () => new Promise(resolve => {complete = resolve;});
  const result = await observer.snapshot(page, 'stalled', 5);
  assert.deepEqual(result, {status: 'TIMEOUT', stopCase: true});
  await assert.rejects(observer.snapshot(page, 'retry'), /not allowed/);
  const length = observer.report().length;
  complete({}); await Promise.resolve(); await Promise.resolve();
  assert.equal(observer.report().length, length);
});
test('page crash, process signal and cleanup disconnect stay separate', () => {
  const {observer, page, browser} = fake();
  page.emit('crash'); observer.processExit({pid: 123, signal: 'SIGABRT', source: 'synthetic'});
  observer.beginCleanup(); browser.emit('disconnected'); page.emit('close');
  const events = observer.report();
  assert.deepEqual(events.map(e => e.type), ['page.crash','process.exit','cleanup.start','browser.disconnected','page.close']);
  assert.deepEqual(events.map(e => e.cleanup), [false,false,true,true,true]);
  assert.throws(() => observer.processExit({signal: 'SIGABRT'}), /missing/);
  observer.dispose(); page.emit('crash'); assert.equal(observer.report().length, 5);
});
test('process exit requires exactly one usable exit code or signal', () => {
  const {observer} = fake();
  const exit = {pid: 123, source: 'synthetic'};
  for (const details of [
    {},
    {signal: ''},
    {signal: '   '},
    {code: 0, signal: 'SIGABRT'},
    {code: 'bad', signal: 'SIGABRT'},
    {code: 0, signal: false},
    {code: 0, source: '   '},
  ]) {
    assert.throws(() => observer.processExit({...exit, ...details}), /missing/);
  }
  assert.deepEqual(observer.report(), []);
  observer.processExit({...exit, code: 0, signal: null});
  observer.processExit({...exit, code: null, signal: 'SIGABRT'});
  assert.deepEqual(observer.report().map(event => event.details), [
    {...exit, code: 0, signal: null},
    {...exit, code: null, signal: 'SIGABRT'},
  ]);
});
test('public event is labeled page-reported; report is detached', () => {
  const {observer} = fake();
  observer.publicEvent({name: 'currententrychange', frame: 'main', documentTimeMs: 4});
  assert.throws(() => observer.publicEvent({name: 'unknown'}), /unknown/);
  const copy = observer.report(); copy[0].details.origin = 'fake';
  assert.equal(observer.report()[0].details.origin, 'page-reported');
});
test('public event adapter installs future-document listeners and labels frames', async () => {
  const {observer, page} = fake();
  const main = {}, sub = {};
  const windowEvents = new Map(), navEvents = new Map();
  let binding;
  page.mainFrame = () => main;
  page.exposeBinding = async (name, fn) => {assert.equal(name, '__stage4aReport'); binding = fn;};
  page.addInitScript = async fn => fn({
    addEventListener: (type, handler) => windowEvents.set(type, handler),
    navigation: {addEventListener: (type, handler) => navEvents.set(type, handler)},
    performance: {timeOrigin: 123},
    __stage4aReport: details => binding({frame: main}, details),
  });
  await installPublicEventAdapter(page, observer);
  windowEvents.get('popstate')({type: 'popstate', timeStamp: 4});
  navEvents.get('currententrychange')({type: 'currententrychange', timeStamp: 5});
  binding({frame: sub}, {name: 'navigate', documentSeq: 1});
  const events = observer.report();
  assert.deepEqual(events.map(e => e.details.frame), ['main', 'main', 'subframe']);
  assert.deepEqual(events.map(e => e.details.documentSeq), [1, 2, 1]);
  assert.equal(events[0].details.timeOriginMs, 123);
});
test('public events keep frame and document identity across matching timestamps and reloads', async () => {
  const {observer, page} = fake();
  const main = {}, firstFrame = {}, secondFrame = {};
  let binding, install;
  page.mainFrame = () => main;
  page.exposeBinding = async (_, fn) => {binding = fn;};
  page.addInitScript = async fn => {install = fn;};
  await installPublicEventAdapter(page, observer);

  const startDocument = (frame, entropy) => {
    const listeners = new Map();
    install({
      addEventListener: (type, handler) => listeners.set(type, handler),
      crypto: {getRandomValues: words => words.fill(entropy)},
      performance: {timeOrigin: 123},
      __stage4aReport: details => binding({frame}, details),
    });
    return () => listeners.get('pageshow')({type: 'pageshow', timeStamp: 4});
  };
  const firstDocument = startDocument(firstFrame, 1);
  firstDocument();
  startDocument(secondFrame, 2)();
  startDocument(firstFrame, 3)();
  firstDocument();

  const [first, second, reloaded, late] = observer.report().map(event => event.details);
  assert.deepEqual([first, second, reloaded, late].map(event => event.frame), Array(4).fill('subframe'));
  assert.deepEqual([first, second, reloaded, late].map(event => event.documentSeq), [1, 1, 1, 2]);
  assert.ok([first, second, reloaded, late].every(event => event.timeOriginMs === 123 && event.documentTimeMs === 4));
  assert.ok([first, second, reloaded, late].every(event => event.documentId));
  assert.notEqual(first.frameId, second.frameId);
  assert.equal(first.frameId, reloaded.frameId);
  assert.equal(first.frameId, late.frameId);
  assert.equal(new Set([first.documentId, second.documentId, reloaded.documentId]).size, 3);
  assert.equal(first.documentId, late.documentId);
});
