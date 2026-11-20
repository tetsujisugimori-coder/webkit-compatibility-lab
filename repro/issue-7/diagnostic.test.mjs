import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { observeRequest } from './diagnostic.mjs';

const request = (type = 'script', errorText = 'ABORT') => ({ type, url: '/fixture.js', failure: () => ({ errorText }) });
const select = r => r.type === 'script' && r.url === '/fixture.js';
function verifyCleanup(page) { assert.deepEqual(page.eventNames(), []); }

test('exact request failure wins; same URL, selecting and non-selecting objects cannot finish it', async () => {
  const page = new EventEmitter(), target = request(), impostor = request('script', 'WRONG'), other = request('fetch');
  const monitor = observeRequest(page, select, { deadlineMs: 1000 });
  page.emit('request', other);
  page.emit('requestfailed', other);
  page.emit('request', target);
  page.emit('request', impostor);
  page.emit('requestfailed', impostor);
  page.emit('requestfinished', impostor);
  assert.equal(monitor.matches(target), true);
  assert.equal(monitor.matches(impostor), false);
  page.emit('requestfailed', target);
  const decision = await monitor.done;
  assert.equal(decision.status, 'FAIL');
  assert.equal(decision.via, 'requestfailed');
  assert.equal(decision.reason, 'ABORT');
  assert.ok(decision.elapsedMs < 1000);
  assert.ok(Number.isFinite(Date.parse(decision.at)));
  page.emit('requestfinished', target);
  page.emit('close');
  monitor.dispose();
  assert.equal(await monitor.done, decision);
  verifyCleanup(page);
});

test('successful target completes immediately and late failure cannot override', async () => {
  const page = new EventEmitter(), target = request();
  const monitor = observeRequest(page, select);
  page.emit('request', target);
  page.emit('requestfinished', target);
  page.emit('requestfailed', target);
  assert.equal((await monitor.done).status, 'PASS');
  assert.equal((await monitor.done).via, 'requestfinished');
  verifyCleanup(page);
});

test('unrelated failure ends at deadline, not on the unrelated event', async () => {
  const page = new EventEmitter(), target = request();
  const monitor = observeRequest(page, select, { deadlineMs: 20 });
  page.emit('request', target);
  page.emit('requestfailed', request());
  const decision = await monitor.done;
  page.emit('requestfailed', target);
  assert.equal(decision.status, 'FAIL');
  assert.equal(decision.via, 'deadline');
  assert.equal(await monitor.done, decision);
  verifyCleanup(page);
});

for (const [event, via] of [['close', 'page-close'], ['crash', 'page-crash'], ['dispose', 'disposed']]) {
  test(`${event} yields distinct failure and removes observers`, async () => {
    const page = new EventEmitter();
    const monitor = observeRequest(page, select);
    if (event === 'dispose') monitor.dispose(); else page.emit(event);
    assert.equal((await monitor.done).status, 'FAIL');
    assert.equal((await monitor.done).via, via);
    verifyCleanup(page);
  });
}
