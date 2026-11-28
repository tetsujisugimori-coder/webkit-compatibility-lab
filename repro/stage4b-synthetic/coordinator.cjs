'use strict';
// Synthetic-only scheduler. Its input language does not contain an executable,
// script path, target, URL, browser version, or code to execute.
const {randomUUID} = require('node:crypto');
const {performance} = require('node:perf_hooks');
const {Worker} = require('node:worker_threads');
const {join} = require('node:path');
const CAPS = Object.freeze({variantMs: 15000, suiteMs: 60000, cleanupMs: 1000});
const DEFAULTS = Object.freeze({variantMs: 2000, suiteMs: 12000, cleanupMs: 500});
const VARIANTS = Object.freeze(['complete', 'headers-only', 'late-document', 'malformed', 'worker-error', 'deadline']);
const TYPES = new Set(['document', 'snapshot', 'request', 'headers', 'body', 'ready']);
const LIMIT = 256;
const STREAM_LIMIT = 65536;
const id = x => typeof x === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(x);

function realStartGate() {
  return {mode: 'real', status: 'BLOCKED', started: false, reason: 'NO_REAL_ADAPTER',
    acceptance: 'NOT_TESTED'};
}

function correlate(receipts, binding) {
  if (!Array.isArray(receipts) || !id(binding?.runId) || !id(binding?.caseId))
    throw new Error('missing or invalid evidence binding');
  let originSeq = 0, active, ready = false;
  const requests = new Map(), accepted = [], quarantined = [];
  const reject = (row, reason) => quarantined.push({hostSeq: row?.hostSeq ?? null, reason});
  for (const [i, row] of receipts.entries()) {
    const x = row?.payload;
    if (row?.hostSeq !== i + 1 || x?.runId !== binding.runId || x?.caseId !== binding.caseId ||
        !id(x?.frameId) || !id(x?.documentId) || !TYPES.has(x?.kind) ||
        !Number.isInteger(x?.originSeq) || x.originSeq <= originSeq) {
      reject(row, 'IDENTITY_OR_SEQUENCE'); continue;
    }
    originSeq = x.originSeq;
    if (x.kind === 'document') {
      if (active) { reject(row, 'DUPLICATE_DOCUMENT'); continue; }
      active = x;
    }
    if (!active || x.frameId !== active.frameId || x.documentId !== active.documentId) {
      reject(row, 'OTHER_DOCUMENT'); continue;
    }
    if (x.kind === 'snapshot' && (x.value?.status !== 'SYNTHETIC' || !id(x.value?.marker))) {
      reject(row, 'INVALID_SNAPSHOT_PAYLOAD'); continue;
    }
    if (['request', 'headers', 'body'].includes(x.kind)) {
      if (ready) { reject(row, 'NETWORK_EVENT_AFTER_READY'); continue; }
      if (!id(x.requestId)) { reject(row, 'MISSING_REQUEST_ID'); continue; }
      const state = requests.get(x.requestId);
      if (x.kind === 'request') {
        if (state) { reject(row, 'DUPLICATE_REQUEST'); continue; }
        requests.set(x.requestId, {headers: false, body: false});
      } else if (x.kind === 'headers') {
        if (!state || state.headers || !Number.isInteger(x.status) || x.status < 100 || x.status > 599) {
          reject(row, 'INVALID_HEADERS_CHAIN'); continue;
        }
        state.headers = true;
      } else {
        if (!state?.headers || state.body) { reject(row, 'INVALID_BODY_CHAIN'); continue; }
        state.body = true;
      }
    }
    if (x.kind === 'ready') {
      if (ready || requests.size === 0 || ![...requests.values()].every(r => r.body)) {
        reject(row, 'INVALID_READY_CHAIN'); continue;
      }
      ready = true;
    }
    accepted.push(row.hostSeq);
  }
  return {accepted, quarantined, documentBound: Boolean(active), requestsOpened: requests.size,
    snapshotObserved: receipts.some(r => r && accepted.includes(r.hostSeq) && r.payload.kind === 'snapshot'),
    responseHeaders: [...requests.values()].filter(r => r.headers).length,
    responseBody: [...requests.values()].filter(r => r.body).length,
    readyObserved: ready};
}

function validated(options) {
  const keys = Object.keys(options);
  if (keys.some(k => !Object.hasOwn(DEFAULTS, k))) throw new Error('unknown bound argument');
  const out = {...DEFAULTS, ...options};
  for (const [k, value] of Object.entries(out))
    if (!Number.isInteger(value) || value <= 0 || value > CAPS[k]) throw new Error('invalid upper bound: ' + k);
  return out;
}

async function runCase(variant, binding, stopAt, deadlineReason, cleanupMs) {
  const started = performance.now();
  const row = {...binding, variant, attempt: 1, receipts: [], status: 'INCOMPLETE', stop: 'UNOBSERVED',
    worker: {threadId: null, exitCode: null, startup: 'UNOBSERVED', onlineObserved: false,
      cleanup: 'NOT_NEEDED', cleanupError: null, error: null},
    stdout: '', stderr: '', streamsEncoding: 'base64', streamsTruncated: false};
  const buffers = {stdout: Buffer.alloc(0), stderr: Buffer.alloc(0)};
  let receiving = true;
  let worker;
  try {
    worker = new Worker(join(__dirname, 'fixture.cjs'), {
      workerData: {...binding, variant}, stdout: true, stderr: true, execArgv: [], env: {},
      resourceLimits: {maxOldGenerationSizeMb: 16, maxYoungGenerationSizeMb: 4},
    });
  } catch (error) {
    row.worker.startup = 'CONSTRUCTOR_FAILED';
    row.worker.error = typeof error?.message === 'string' ? error.message : 'Unreadable constructor failure';
    row.stop = 'WORKER_START_FAILED';
    row.evidence = correlate(row.receipts, binding);
    row.elapsedMs = row.observationEndMs = performance.now() - started;
    return row;
  }
  row.worker.startup = 'THREAD_CREATED';
  row.worker.threadId = worker.threadId;
  worker.once('online', () => { if (receiving) row.worker.onlineObserved = true; });
  const capture = name => worker[name].on('data', data => {
    if (!receiving) return;
    const allowed = STREAM_LIMIT - buffers[name].length;
    if (data.length > allowed) row.streamsTruncated = true;
    if (allowed > 0) buffers[name] = Buffer.concat([buffers[name], data.subarray(0, allowed)]);
  });
  capture('stdout'); capture('stderr');
  let cancel, timer, expired = false;
  const stopped = new Promise(resolve => { cancel = resolve; });
  function stop(reason) {
    if (row.stop !== 'UNOBSERVED') return;
    row.stop = reason; expired = true; cancel();
  }
  worker.on('message', message => {
    if (expired) return;
    if (performance.now() >= stopAt) { stop(deadlineReason); return; }
    if (row.receipts.length === LIMIT) { stop('EVENT_LIMIT'); return; }
    row.receipts.push({hostSeq: row.receipts.length + 1, receivedMs: performance.now() - started, payload: message});
  });
  worker.once('error', error => { if (receiving) row.worker.error = error.message; });
  const exit = new Promise(resolve => worker.once('exit', code => { if (receiving) row.worker.exitCode = code; resolve(); }));
  timer = setTimeout(() => stop(deadlineReason), Math.max(0, Math.ceil(stopAt - performance.now())));
  try {
    await Promise.race([exit, stopped]);
    if (!expired && performance.now() >= stopAt) stop(deadlineReason);
  } finally { clearTimeout(timer); }
  row.observationEndMs = performance.now() - started;
  if (expired && row.worker.exitCode === null) {
    let watchdog;
    try {
      const terminate = worker.terminate().then(() => true, error => {
        if (receiving) row.worker.cleanupError = typeof error?.message === 'string' ?
          error.message : 'Unreadable termination failure';
        return false;
      });
      const done = await Promise.race([terminate, new Promise(resolve => {
        watchdog = setTimeout(() => resolve(false), cleanupMs);
      })]);
      row.worker.cleanup = done && row.worker.exitCode !== null ? 'CONFIRMED' : 'UNCONFIRMED';
    } catch (error) {
      row.worker.cleanup = 'UNCONFIRMED';
      row.worker.cleanupError = typeof error?.message === 'string' ? error.message : 'Unreadable termination failure';
    } finally { clearTimeout(watchdog); }
    if (row.worker.cleanup === 'UNCONFIRMED') worker.unref();
  }
  receiving = false;
  if (!expired) row.stop = 'WORKER_EXIT';
  row.stdout = buffers.stdout.toString('base64'); row.stderr = buffers.stderr.toString('base64');
  row.evidence = correlate(row.receipts, binding);
  row.elapsedMs = performance.now() - started;
  // Exit is a different observation from event readiness. Never infer crash.
  if (expired) row.status = 'INCOMPLETE';
  else if (row.worker.error || row.worker.exitCode !== 0) row.status = 'WORKER_ERROR';
  else if (row.evidence.readyObserved && row.evidence.snapshotObserved &&
    row.evidence.quarantined.length === 0 && !row.streamsTruncated && row.evidence.responseBody === row.evidence.responseHeaders) row.status = 'COMPLETE';
  return row;
}

async function runSuite(variants = VARIANTS, options = {}) {
  const bounds = validated(options);
  if (!Array.isArray(variants) || variants.length === 0 || new Set(variants).size !== variants.length ||
      variants.some(x => !VARIANTS.includes(x))) throw new Error('only unique generated variants are allowed');
  const runId = randomUUID();
  const report = {schema: 1, mode: 'synthetic', runId, caps: CAPS, bounds, attemptsPerVariant: 1,
    real: realStartGate(), environment: {node: process.version, platform: process.platform, arch: process.arch},
    cases: [], startedAt: new Date().toISOString()};
  const end = performance.now() + bounds.suiteMs;
  let blockedBy = null;
  for (const [index, variant] of variants.entries()) {
    const caseId = 'case-' + (index + 1);
    const now = performance.now();
    if (blockedBy || now >= end) {
      report.cases.push({runId, caseId, variant, attempt: 0, status: 'NOT_TESTED',
        stop: blockedBy ?? 'SUITE_DEADLINE'});
      continue;
    }
    const observationEnd = now + bounds.variantMs;
    let row;
    try {
      row = await runCase(variant, {runId, caseId}, Math.min(observationEnd, end),
        end <= observationEnd ? 'SUITE_DEADLINE' : 'OBSERVATION_DEADLINE', bounds.cleanupMs);
    } catch (error) {
      row = {runId, caseId, variant, attempt: 1, status: 'INCOMPLETE', stop: 'UNEXPECTED_RUNNER_FAILURE',
        worker: {threadId: null, exitCode: null, cleanup: 'UNCONFIRMED', error: error.message}, receipts: []};
    }
    report.cases.push(row);
    if (row.worker.cleanup === 'UNCONFIRMED') blockedBy = 'PRIOR_CLEANUP_UNCONFIRMED';
    else if (row.stop === 'WORKER_START_FAILED') blockedBy = 'PRIOR_WORKER_START_FAILED';
  }
  report.finishedAt = new Date().toISOString();
  return report;
}
module.exports = {CAPS, VARIANTS, runSuite, correlate, realStartGate};
