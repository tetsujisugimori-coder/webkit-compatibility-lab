'use strict';

// Stage 4-A: read-only observation, no browser launch or product verdict.
function readPublicState(root = globalThis) {
  const read = fn => {
    try {
      const value = fn();
      return value === undefined ? {status: 'UNSUPPORTED'} : {status: 'OK', value};
    } catch (error) {
      return {status: 'ERROR', message: String(error.message || error).slice(0, 300)};
    }
  };
  const entry = e => e === undefined ? undefined : e === null ? null : {key: e.key, id: e.id, url: e.url};
  return {
    href: read(() => root.location?.href),
    historyLength: read(() => root.history?.length),
    currentEntry: read(() => entry(root.navigation?.currentEntry)),
    entriesLength: read(() => root.navigation?.entries?.()?.length),
    activation: read(() => {
      const a = root.navigation?.activation;
      return a === undefined ? undefined : a === null ? null :
        {navigationType: a.navigationType, from: entry(a.from)};
    }),
    navigationAvailable: read(() => root.navigation != null),
  };
}

// Install only on a dedicated diagnostic page BEFORE navigation. Never call in 4-A tests
// with a real browser. The page-reported events are asynchronous observations, not ground truth.
function installPageListeners(root = globalThis) {
  let seq = 0;
  const report = event => {
    const details = {name: event.type, documentSeq: ++seq,
      documentTimeMs: event.timeStamp, timeOriginMs: root.performance?.timeOrigin};
    try { Promise.resolve(root.__stage4aReport(details)).catch(() => {}); } catch (_) {}
  };
  for (const type of ['popstate', 'hashchange', 'pageshow', 'pagehide']) root.addEventListener(type, report);
  for (const type of ['navigate', 'navigatesuccess', 'navigateerror', 'currententrychange']) {
    root.navigation?.addEventListener(type, report);
  }
}
async function installPublicEventAdapter(page, observer) {
  await page.exposeBinding('__stage4aReport', (source, details) => {
    const frame = !source.frame ? 'unknown' : source.frame === page.mainFrame() ? 'main' : 'subframe';
    observer.publicEvent({...details, frame});
  });
  await page.addInitScript(installPageListeners);
}

function createObserver({clock = () => Number(process.hrtime.bigint()) / 1e6,
  wallClock = () => new Date().toISOString()} = {}) {
  const started = clock();
  const events = [];
  const ids = new WeakMap();
  const subscriptions = [];
  let nextRequest = 0, step = null, cleanup = false, disposed = false, pendingSnapshot = false;
  function record(type, details = {}) {
    if (disposed) throw new Error('observer disposed');
    const event = {seq: events.length + 1, t_ms: clock() - started,
      at: wallClock(), step, cleanup, type, details};
    events.push(event);
    return event;
  }
  function requestInfo(request) {
    if (!request.isNavigationRequest()) return null;
    if (!ids.has(request)) ids.set(request, ++nextRequest);
    return {requestId: ids.get(request), url: request.url()};
  }
  function listen(target, type, handler) {
    const safe = (...args) => {
      try { handler(...args); } catch (e) {
        record('observation.error', {event: type, message: String(e.message || e)});
      }
    };
    target.on(type, safe);
    subscriptions.push(() => target.off(type, safe));
  }
  function attach(page, browser) {
    if (disposed || subscriptions.length) throw new Error('observer cannot attach twice');
    const requestEvent = (type, r, extra = {}) => {
      const info = requestInfo(r);
      if (info) record(type, {...info, ...extra});
    };
    listen(page, 'request', r => requestEvent('http.request', r));
    listen(page, 'response', r => requestEvent('http.response', r.request(), {status: r.status()}));
    listen(page, 'requestfinished', r => requestEvent('http.request.finished', r));
    listen(page, 'requestfailed', r => requestEvent('http.request.failed', r, {failure: r.failure()}));
    for (const type of ['domcontentloaded', 'load', 'crash', 'close']) {
      listen(page, type, () => record('page.' + type));
    }
    listen(browser, 'disconnected', () => record('browser.disconnected'));
  }
  async function snapshot(page, label, timeoutMs = 500) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 15000) throw new Error('invalid snapshot timeout');
    if (disposed || pendingSnapshot || cleanup) throw new Error('snapshot not allowed');
    pendingSnapshot = true;
    record('snapshot.start', {label, timeoutMs});
    let timer;
    // No retries. A timed-out evaluation may still be pending: caller must stop the case.
    const read = Promise.resolve().then(() => page.evaluate(readPublicState)).then(
      value => ({status: 'OK', value}),
      error => ({status: 'ERROR', message: String(error.message || error)}));
    const result = await Promise.race([read, new Promise(resolve => {
      timer = setTimeout(() => resolve({status: 'TIMEOUT', stopCase: true}), timeoutMs);
    })]);
    clearTimeout(timer);
    if (result.status !== 'TIMEOUT') pendingSnapshot = false;
    record('snapshot.end', {label, ...result});
    return result;
  }
  function publicEvent(details) {
    // Supplied by a future page adapter; browser timestamps are not host monotonic time.
    if (!['navigate', 'navigatesuccess', 'navigateerror', 'currententrychange', 'popstate', 'hashchange', 'pageshow', 'pagehide'].includes(details?.name)) throw new Error('unknown public event');
    return record('public.event', {name: details.name, frame: details.frame ?? null,
      documentTimeMs: details.documentTimeMs ?? null, documentSeq: details.documentSeq ?? null,
      timeOriginMs: details.timeOriginMs ?? null, origin: 'page-reported'});
  }
  function processExit(details) {
    if (!Number.isInteger(details?.pid) || details.pid <= 0 || typeof details.source !== 'string' || !details.source ||
      (!Number.isInteger(details.code) && typeof details.signal !== 'string')) throw new Error('process exit evidence missing');
    return record('process.exit', {pid: details.pid, code: details.code ?? null,
      signal: details.signal ?? null, source: details.source});
  }
  return {attach, snapshot, publicEvent, processExit,
    beginStep(name) { step = name; record('step.start', {name}); },
    endStep() { record('step.end', {name: step}); step = null; },
    beginCleanup() { cleanup = true; record('cleanup.start'); },
    dispose() { for (const off of subscriptions.splice(0)) off(); disposed = true; },
    report() { return JSON.parse(JSON.stringify(events)); },
  };
}
module.exports = {createObserver, readPublicState, installPublicEventAdapter, installPageListeners};
