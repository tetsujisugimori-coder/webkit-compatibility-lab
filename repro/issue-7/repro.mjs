import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';
import { chromium, webkit } from 'playwright';
import { observeRequest } from './diagnostic.mjs';

const require = createRequire(import.meta.url);
const deadlineMs = 5_000;
const body404 = Buffer.from(('/*' + ' synthetic missing script '.repeat(4)).slice(0, 94).padEnd(94) + '*/');
const sha = data => createHash('sha256').update(data).digest('hex');
const now = () => ({ at: new Date().toISOString(), ms: performance.now() });
const ref = '/fixture.js';
const markers = "globalThis.fixtureRuns = (globalThis.fixtureRuns ?? 0) + 1;";
let fixtureCount, secondStatus, serverRecords;
const server = createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }).end('<!doctype html><title>Lab Issue 7</title>');
    return;
  }
  if (request.url !== ref) { response.writeHead(404).end(); return; }
  const sequence = ++fixtureCount;
  const status = sequence === 1 ? 200 : secondStatus;
  const body = status === 200 ? Buffer.from(markers) : body404;
  const record = { ...now(), sequence, status, bodyBytes: body.length, bodySha256: sha(body), ifNoneMatch: request.headers['if-none-match'] ?? null };
  serverRecords.push(record);
  response.once('finish', () => { record.finished = now(); });
  response.once('close', () => { record.closed = now(); });
  response.writeHead(status, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store', 'Content-Length': body.length }).end(body);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = 'http://127.0.0.1:' + server.address().port;
const report = { playwright: require('playwright/package.json').version, node: process.version, deadlineMs, cacheControl: 'no-store', routing: false, rows: [] };
const trigger = (page, kind) => page.evaluate(async ({ kind, ref }) => {
  if (kind === 'fetch') {
    const response = await fetch(ref);
    return { status: response.status, bytes: [...new Uint8Array(await response.arrayBuffer())] };
  }
  return new Promise(resolve => {
    const element = document.createElement('script');
    element.src = ref;
    for (const event of ['load', 'error']) element.addEventListener(event, () => resolve({ event, marker: globalThis.fixtureRuns ?? 0 }), { once: true });
    document.head.append(element);
  });
}, {kind, ref});

async function examine(page, kind, compareLegacy) {
  const url = origin + ref;
  const count = event => page.listenerCount(event);
  const eventNames = ['request', 'response', 'requestfinished', 'requestfailed', 'close', 'crash'];
  const before = eventNames.map(count);
  const diagnostic = observeRequest(page, request => request.url() === url && request.resourceType() === kind, { deadlineMs });
  const events = [];
  let oldNotice, oldFinal, oldTimer, browserResponse, responseTask;
  let oldResolved = false;
  function add(type, req, details = {}) {
    if (diagnostic.matches(req)) events.push({ type, ...now(), ...details });
  }
  const handlers = [
    ['request', req => add('request', req)],
    ['requestfinished', req => add('requestfinished', req)],
    ['requestfailed', req => add('requestfailed', req, { reason: req.failure()?.errorText ?? null })],
    ['response', res => {
      const req = res.request();
      if (!diagnostic.matches(req)) return;
      browserResponse = { status: res.status(), ...now(), cacheControl: res.headers()['cache-control'] };
      add('response', req, { status: res.status() });
      if (compareLegacy) responseTask = res.finished().then(
        () => { oldResolved = true; oldFinal = { via: 'response-finished', ...now() }; },
        () => { oldResolved = true; oldFinal = { via: 'response-rejected', ...now() }; }
      );
    }],
  ];
  for (const [event, callback] of handlers) page.on(event, callback);
  const start = now();
  const oldDone = compareLegacy && new Promise(resolve => {
    oldTimer = setTimeout(() => resolve({
      via: 'deadline', ...now(), unresolved: !oldResolved, promiseStarted: Boolean(responseTask),
    }), deadlineMs);
  });
  // The legacy experiment waits for its own deadline independently of the new decision.
  let actionTimer;
  const pageResult = Promise.race([
    trigger(page, kind),
    new Promise((_, reject) => { actionTimer = setTimeout(() => reject(new Error('page observer deadline')), deadlineMs); }),
  ]).finally(() => clearTimeout(actionTimer));
  try {
    const [decision, observed] = await Promise.all([diagnostic.done, pageResult]);
    if (compareLegacy) oldNotice = await oldDone;
    return { start, decision, observed, events, browserResponse, oldNotice, legacySettlement: () => oldFinal, responseTask, listenerCleanup: null };
  } finally {
    diagnostic.dispose();
    clearTimeout(oldTimer);
    for (const [event, callback] of handlers) page.off(event, callback);
    assert.deepEqual(eventNames.map(count), before, 'temporary listeners must be removed');
  }
}

async function scenario(browser, engine, kind, status) {
  fixtureCount = 0; secondStatus = status; serverRecords = [];
  const accounting = serverRecords;
  const context = await browser.newContext();
  const row = { engine, browserVersion: browser.version(), kind, status };
  try {
    const page = await context.newPage();
    await page.goto(origin, { timeout: deadlineMs });
    const first = await examine(page, 'script', false);
    row.first = first;
    assert.equal(first.decision.via, 'requestfinished');
    assert.equal(first.browserResponse.status, 200);
    assert.deepEqual(first.observed, { event: 'load', marker: 1 });
    const second = await examine(page, kind, status === 404 && kind === 'script');
    row.second = second;
    assert.equal(accounting.length, 2);
    assert.deepEqual(accounting.map(x => [x.sequence, x.status, x.ifNoneMatch, Boolean(x.finished)]), [[1, 200, null, true], [2, status, null, true]]);
    for (const check of [first, second]) {
      assert.equal(check.browserResponse.cacheControl, 'no-store');
      check.listenerCleanup = 'PASS';
    }
    assert.equal(second.browserResponse.status, status);
    if (kind === 'script' && status === 404) {
      const failure = second.events.find(x => x.type === 'requestfailed');
      assert.ok(failure?.reason, 'real target requestfailed must exist');
      assert.equal(second.decision.status, 'FAIL');
      assert.equal(second.decision.via, 'requestfailed');
      assert.equal(second.decision.reason, failure.reason);
      assert.ok(second.decision.elapsedMs < deadlineMs);
      assert.ok(second.oldNotice.promiseStarted);
      assert.ok(second.oldNotice.unresolved, 'prior 5-second behavior must reproduce; not a green assumption');
      assert.deepEqual(second.observed, { event: 'error', marker: 1 });
      assert.ok(second.decision.ms < second.oldNotice.ms);
    } else {
      assert.equal(second.decision.via, 'requestfinished');
      assert.equal(second.decision.status, 'PASS');
      if (kind === 'script') assert.deepEqual(second.observed, { event: 'load', marker: 2 });
      else {
        assert.equal(second.observed.status, 404);
        assert.equal(second.observed.bytes.length, body404.length);
        assert.equal(sha(Buffer.from(second.observed.bytes)), accounting[1].bodySha256);
        second.observed.bodySha256 = sha(Buffer.from(second.observed.bytes));
        second.observed.bodyBytes = second.observed.bytes.length;
        delete second.observed.bytes;
      }
    }
    row.regression = 'PASS';
  } catch (error) {
    row.regression = 'FAIL'; row.error = error.message;
  } finally {
    const second = row.second;
    row.contextClose = now();
    await context.close();
    if (second?.responseTask) {
      let timer;
      await Promise.race([second.responseTask, new Promise(resolve => { timer = setTimeout(resolve, 250); })]);
      clearTimeout(timer);
      second.legacyAfterClose = second.legacySettlement() ?? null;
    }
    if (second) {
      const beforeClose = second.decision.ms < row.contextClose.ms;
      second.beforeContextClose = beforeClose;
      if (!beforeClose) { row.regression = 'FAIL'; row.error ??= 'terminal decision must precede close'; }
    }
    row.server = accounting;
  }
  return row;
}

try {
  const requested = process.argv.slice(2);
  const engines = Object.entries({ chromium, webkit }).filter(([name]) => !requested.length || requested.includes(name));
  assert.ok(engines.length && requested.every(x => engines.some(([name]) => name === x)), 'pass chromium or webkit only');
  for (const [engine, type] of engines) {
    let browser;
    try {
      browser = await type.launch({ timeout: 10_000 });
      for (const [kind, status] of [['script', 200], ['script', 404], ['fetch', 404]]) report.rows.push(await scenario(browser, engine, kind, status));
    } catch (error) {
      report.rows.push({ engine, regression: browser ? 'FAIL' : 'NOT_TESTED', error: String(error.message).split('\n')[0] });
    } finally {
      await browser?.close();
    }
  }
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify(report, (key, value) => key === 'responseTask' || key === 'legacySettlement' ? undefined : value, 2));
  if (report.rows.some(row => row.regression !== 'PASS')) process.exitCode = 1;
}
