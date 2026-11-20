// Local Lab observer. It does not change HTTP or Playwright behavior.
import { performance } from 'node:perf_hooks';

/** Arm before the operation; select the first eligible request, then match by object.
 * A bound that expires without a terminal event remains a failure. */
export function observeRequest(page, select, { deadlineMs = 5_000 } = {}) {
  const start = performance.now();
  let target, result, timer, resolve;
  const done = new Promise(r => { resolve = r; });
  function settle(status, via, reason = null) {
    if (result) return;
    const ms = performance.now();
    result = Object.freeze({ status, via, reason, elapsedMs: ms - start, ms, at: new Date().toISOString() });
    clearTimeout(timer);
    for (const [event, callback] of handlers) page.off(event, callback);
    resolve(result);
  }
  const handlers = [
    ['request', req => { if (!target && select(req)) target = req; }],
    ['requestfinished', req => { if (target && req === target) settle('PASS', 'requestfinished'); }],
    ['requestfailed', req => { if (target && req === target) settle('FAIL', 'requestfailed', req.failure()?.errorText ?? null); }],
    ['close', () => settle('FAIL', 'page-close')],
    ['crash', () => settle('FAIL', 'page-crash')],
  ];
  for (const [event, callback] of handlers) page.on(event, callback);
  timer = setTimeout(() => settle('FAIL', 'deadline'), deadlineMs);
  return { done, dispose: () => settle('FAIL', 'disposed'), matches: req => Boolean(target && req === target) };
}
