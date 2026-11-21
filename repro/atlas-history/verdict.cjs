'use strict';
const WINDOW_MS = 750;

// An initial exception is an observation, not necessarily the final outcome.
function classify({error, events, passed}) {
  const message = String(error && (error.stack || error.message) || error || '');
  if (events.some(e => e.type === 'page.crash') || /Page crashed|Target page.*crashed/i.test(message)) return 'CRASH';
  if (events.some(e => e.type === 'browser.disconnected' && !e.expected)) return 'DISCONNECTED';
  if (passed) return 'PASS';
  if (/Timeout|timed out/i.test(message)) return 'TIMEOUT';
  return error ? 'FAIL' : 'INCOMPLETE';
}

// A single bounded window makes late crash/disconnect visible before final classification.
async function finalize({error, passed, events, close, record, wait = ms => new Promise(resolve => setTimeout(resolve, ms)), windowMs = WINDOW_MS}) {
  const provisional = classify({error, events, passed});
  record('verdict.provisional', {value: provisional});
  if (provisional === 'TIMEOUT') {
    record('timeout.observation.start', {window_ms: windowMs});
    await wait(windowMs);
    record('timeout.observation.end');
  }
  if (close) await close();
  const result = classify({error, events, passed});
  record('verdict.final', {value: result, provisional});
  return {provisional, result, observation_window_ms: provisional === 'TIMEOUT' ? windowMs : 0};
}

function recorder(entry) {
  const start = process.hrtime.bigint();
  let seq = 0;
  return (type, extra = {}) => {
    entry.events.push({
      seq: ++seq, t_ms: Number((Number(process.hrtime.bigint() - start) / 1e6).toFixed(3)),
      at: new Date().toISOString(), step: entry.current_step || null, type, ...extra,
    });
  };
}
module.exports = {classify, finalize, recorder, WINDOW_MS};
