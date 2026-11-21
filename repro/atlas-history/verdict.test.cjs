'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {classify, finalize, recorder} = require('./verdict.cjs');
const event = type => ({type});
test('a completed DOM assertion is PASS', () => {
  assert.equal(classify({passed: true, events: [], error: null}), 'PASS');
});
test('HTTP 200 and load alone do not prove the DOM and focus checks', () => {
  assert.equal(classify({passed: false, events: [event('http.response'), event('load')], error: Error('Timeout 15000ms')}), 'TIMEOUT');
});
test('timeout without a later crash remains TIMEOUT', async () => {
  const events = [];
  const result = await finalize({error: Error('Timeout 15000ms'), passed: false, events,
    record: (type, data) => events.push({type, ...data}), wait: async () => {}, close: async () => {}});
  assert.equal(result.result, 'TIMEOUT');
  assert.equal(result.provisional, 'TIMEOUT');
});
test('asynchronous page crash after timeout overrides TIMEOUT', async () => {
  const events = [];
  const result = await finalize({error: Error('Timeout 15000ms'), passed: false, events,
    record: (type, data) => events.push({type, ...data}),
    wait: async () => {await new Promise(resolve => setTimeout(() => {events.push(event('page.crash')); resolve();}, 5));},
    close: async () => {}});
  assert.equal(result.provisional, 'TIMEOUT');
  assert.equal(result.result, 'CRASH');
  assert.ok(events.findIndex(e => e.type === 'page.crash') > events.findIndex(e => e.type === 'verdict.provisional'));
});
test('unexpected browser disconnect gets its own result', async () => {
  const events = [];
  const result = await finalize({error: Error('Timeout 15000ms'), passed: false, events,
    record: (type, data) => events.push({type, ...data}),
    wait: async () => {events.push({type: 'browser.disconnected', expected: false});},
    close: async () => {}});
  assert.equal(result.result, 'DISCONNECTED');
});
test('crash and disconnect are both retained with crash precedence', () => {
  const events = [event('page.crash'), {type: 'browser.disconnected', expected: false}];
  assert.equal(classify({events, passed: false, error: Error('Timeout')}), 'CRASH');
  assert.equal(events.length, 2);
});
test('intentional disconnect is not spontaneous browser termination', () => {
  assert.equal(classify({error: Error('Target closed'), passed: false, events: [{type:'browser.disconnected',expected:true}]}), 'FAIL');
});
test('recorder retains ordering, monotonic time and step identity', () => {
  const entry = {events: [], current_step: 'final C05 page.reload'};
  const record = recorder(entry);
  record('http.response', {status: 200});
  record('http.request.finished');
  record('load');
  assert.deepEqual(entry.events.map(e => e.seq), [1, 2, 3]);
  assert.equal(entry.events[0].step, 'final C05 page.reload');
  assert.ok(entry.events[1].t_ms >= entry.events[0].t_ms);
});
test('HTTP 200 without complete body or load cannot establish success', () => {
  assert.equal(classify({error: Error('Timeout 15000ms'), passed:false, events: [{type:'http.response', status:200}]}), 'TIMEOUT');
});
