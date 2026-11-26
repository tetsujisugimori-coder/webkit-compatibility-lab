'use strict';

// Stage 4-A: read-only observation, no browser launch or product verdict.
function readPublicState(root = globalThis) {
  const read = fn => {
    try {
      const value = fn();
      return value === undefined ? {status: 'UNSUPPORTED'} : {status: 'OK', value};
    } catch (error) {
      try {
        return {status: 'ERROR', message: String(error?.message ?? error).slice(0, 300)};
      } catch {
        return {status: 'ERROR', message: 'Unreadable exception'};
      }
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
  // Keep the identity in this document so even late reports retain it across navigation.
  const documentId = root.crypto?.getRandomValues?.(new Uint32Array(4)).join('-') ?? null;
  let seq = 0;
  const report = event => {
    const details = {name: event.type, documentId, documentSeq: ++seq,
      documentTimeMs: event.timeStamp, timeOriginMs: root.performance?.timeOrigin};
    try { Promise.resolve(root.__stage4aReport(details)).catch(() => {}); } catch (_) {}
  };
  for (const type of ['popstate', 'hashchange', 'pageshow', 'pagehide']) root.addEventListener(type, report);
  for (const type of ['navigate', 'navigatesuccess', 'navigateerror', 'currententrychange']) {
    root.navigation?.addEventListener(type, report);
  }
}
async function installPublicEventAdapter(page, observer) {
  const frameIds = new WeakMap();
  let nextFrameId = 0;
  await page.exposeBinding('__stage4aReport', (source, details) => {
    const sourceFrame = source.frame;
    const frame = !sourceFrame ? 'unknown' : sourceFrame === page.mainFrame() ? 'main' : 'subframe';
    if (sourceFrame && !frameIds.has(sourceFrame)) frameIds.set(sourceFrame, ++nextFrameId);
    observer.publicEvent({...details, frame, frameId: frameIds.get(sourceFrame) ?? null});
  });
  await page.addInitScript(installPageListeners);
}

function errorMessage(error) {
  try {
    return String(error?.message ?? error);
  } catch {
    return 'Unreadable exception';
  }
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
        record('observation.error', {event: type, message: errorMessage(e)});
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
    let timer;
    let result;
    try {
      record('snapshot.start', {label, timeoutMs});
      // No retries. A timed-out evaluation may still be pending: caller must stop the case.
      const read = Promise.resolve().then(() => page.evaluate(readPublicState)).then(
        value => ({status: 'OK', value}),
        error => ({status: 'ERROR', message: errorMessage(error)}));
      result = await Promise.race([read, new Promise(resolve => {
        timer = setTimeout(() => resolve({status: 'TIMEOUT', stopCase: true}), timeoutMs);
      })]);
    } finally {
      clearTimeout(timer);
      if (result?.status !== 'TIMEOUT') pendingSnapshot = false;
    }
    record('snapshot.end', {label, ...result});
    return result;
  }
  function publicEvent(details) {
    // Browser timestamps are independent of host monotonic time.
    if (!['navigate', 'navigatesuccess', 'navigateerror', 'currententrychange', 'popstate', 'hashchange', 'pageshow', 'pagehide'].includes(details?.name)) throw new Error('unknown public event');
    return record('public.event', {name: details.name, frame: details.frame ?? null,
      frameId: details.frameId ?? null, documentId: details.documentId ?? null,
      documentTimeMs: details.documentTimeMs ?? null, documentSeq: details.documentSeq ?? null,
      timeOriginMs: details.timeOriginMs ?? null, origin: 'page-reported'});
  }
  function processExit(details) {
    const {pid, source, code = null, signal = null} = details ?? {};
    const exitedWithCode = Number.isInteger(code) && signal === null;
    const exitedWithSignal = code === null && typeof signal === 'string' && signal.trim().length > 0;
    if (!Number.isInteger(pid) || pid <= 0 || typeof source !== 'string' || !source.trim() ||
      (!exitedWithCode && !exitedWithSignal)) throw new Error('process exit evidence missing or invalid');
    return record('process.exit', {pid, code, signal, source});
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
