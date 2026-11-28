'use strict';
const {createHash} = require('node:crypto');
const {lstatSync, readdirSync, readFileSync, writeFileSync} = require('node:fs');
const {resolve, join} = require('node:path');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const {CAPS, VARIANTS, correlate, realStartGate, runSuite} = require('./coordinator.cjs');
const digest = b => createHash('sha256').update(b).digest('hex');
const prefix = Object.freeze(['document','snapshot','request','headers']);
const extended = Object.freeze([...prefix,'body','ready']);
const expectations = Object.freeze({
  complete: {status:'COMPLETE', types:extended, quarantine:[], body:1, ready:true},
  'headers-only': {status:'INCOMPLETE', types:prefix, quarantine:[], body:0, ready:false},
  'late-document': {status:'INCOMPLETE', types:extended, quarantine:['OTHER_DOCUMENT','OTHER_DOCUMENT'], body:0, ready:false},
  malformed: {status:'INCOMPLETE', types:extended, quarantine:['IDENTITY_OR_SEQUENCE','INVALID_READY_CHAIN'], body:0, ready:false},
  'worker-error': {status:'WORKER_ERROR', types:prefix, quarantine:[], body:0, ready:false},
  deadline: {status:'INCOMPLETE', types:prefix, quarantine:[], body:0, ready:false},
});
function validateFixtureBatch(report) {
  const failures = [];
  if (report?.schema !== 1 || report.mode !== 'synthetic' || typeof report.runId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(report.runId) || !isDeepStrictEqual(report.caps,CAPS) ||
      !isDeepStrictEqual(report.real,realStartGate()) || report.attemptsPerVariant !== 1 ||
      !Array.isArray(report.cases) || report.cases.length !== VARIANTS.length) return ['BATCH_IDENTITY_OR_CENSUS'];
  const threads = new Set();
  for (const [index, variant] of VARIANTS.entries()) {
    const row = report.cases[index], e = expectations[variant], caseId = 'case-' + (index + 1);
    const error = code => failures.push(variant + ':' + code);
    if (!row || row.runId !== report.runId || row.caseId !== caseId || row.variant !== variant ||
        row.attempt !== 1 || row.status !== e.status) {error('FIXTURE_IDENTITY_OR_RESULT'); continue;}
    const fault = variant === 'worker-error', deadline = variant === 'deadline';
    if (row.stop !== (deadline ? 'OBSERVATION_DEADLINE' : 'WORKER_EXIT') ||
        !row.worker || row.worker.startup !== 'THREAD_CREATED' || row.worker.onlineObserved !== true ||
        !Number.isInteger(row.worker.threadId) || row.worker.threadId <= 0 || threads.has(row.worker.threadId) ||
        row.worker.exitCode !== (fault || deadline ? 1 : 0) ||
        row.worker.cleanup !== (deadline ? 'CONFIRMED' : 'NOT_NEEDED') ||
        row.worker.cleanupError !== null || row.worker.error !== (fault ? 'intentional synthetic worker fault' : null)) error('WORKER_STOP_EVIDENCE');
    threads.add(row.worker?.threadId);
    const expectedStdout = Buffer.from('synthetic fixture ' + variant + '\n').toString('base64');
    const expectedStderr = fault ? Buffer.from('planned synthetic fault\n').toString('base64') : '';
    if (row.streamsEncoding !== 'base64' || row.streamsTruncated !== false ||
        row.stdout !== expectedStdout || row.stderr !== expectedStderr) error('STREAM_EVIDENCE');
    if (!Array.isArray(row.receipts) || !isDeepStrictEqual(row.receipts.map(x => x?.payload?.kind), e.types) ||
        row.receipts.some((r,i) => r.hostSeq !== i+1 || r.payload.originSeq !== i+1 ||
          !Number.isFinite(r.receivedMs) || r.receivedMs < 0 ||
          (i > 0 && r.receivedMs < row.receipts[i-1].receivedMs))) {
      error('RAW_RECEIPT_CHAIN'); continue;
    }
    if (row.receipts.some(({payload:x},i) =>
      x.runId !== report.runId || x.caseId !== (variant === 'malformed' && i === 4 ? 'unrelated' : caseId) ||
      x.frameId !== 'frame-1' || x.documentId !== (variant === 'late-document' && i >= 4 ? 'document-former' : 'document-current') ||
      (['request','headers','body'].includes(x.kind) && x.requestId !== 'request-1') ||
      (x.kind === 'headers' && x.status !== 200) ||
      (x.kind === 'snapshot' && !isDeepStrictEqual(x.value,{status:'SYNTHETIC',marker:'fixture-state'})))) error('RAW_FIXTURE_VALUES');
    const actual = correlate(row.receipts, {runId:report.runId, caseId});
    if (!isDeepStrictEqual(row.evidence,actual) || !actual.documentBound || !actual.snapshotObserved ||
        actual.requestsOpened !== 1 || actual.responseHeaders !== 1 || actual.responseBody !== e.body ||
        actual.readyObserved !== e.ready ||
        !isDeepStrictEqual(actual.quarantined.map(x => x.reason),e.quarantine)) error('CORRELATED_EVIDENCE');
  }
  return failures;
}
const write = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
function assertDirectory(root) {
  if (!lstatSync(root).isDirectory()) throw new Error('expected private evidence directory');
}
function commitIdentity() {
  const git = ref => execFileSync('git', ['rev-parse', ref], {
    encoding:'utf8', timeout:3000, stdio:['ignore','pipe','pipe'],
  }).trim();
  return {head:git('HEAD'), tree:git('HEAD^{tree}'), eventSha:process.env.GITHUB_SHA ?? null,
    run:process.env.GITHUB_RUN_ID ?? null, attempt:process.env.GITHUB_RUN_ATTEMPT ?? null};
}
function manifest(root) {
  assertDirectory(root);
  const names = readdirSync(root).sort();
  if (names.includes('manifest.json')) throw new Error('previous manifest must remain unchanged');
  const files = Object.fromEntries(names.map(name => {
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error('unexpected evidence name');
    const file = join(root,name);
    if (!lstatSync(file).isFile()) throw new Error('evidence entry is not a regular file');
    const bytes = readFileSync(file);
    return [name, {size:bytes.length, sha256:digest(bytes)}];
  }));
  let evidenceState = 'PARTIAL';
  const required = ['commit-tree-parent.txt','checkout.json','test.stdout','test.stderr','test.exit',
    'entry.stdout','entry.stderr','entry.exit','report.json'];
  if (required.every(name=>Object.hasOwn(files,name))) {
    try {
      const raw = name => readFileSync(join(root,name),'utf8');
      const report = JSON.parse(raw('report.json'));
      const [head, tree, parent, ...extra] = raw('commit-tree-parent.txt').trimEnd().split('\n');
      if (!extra.length && [head,tree,parent].every(v => /^[0-9a-f]{40}$/.test(v)) &&
          report.checkout?.head === head && report.checkout?.tree === tree &&
          raw('test.exit').trim() === '0' && raw('entry.exit').trim() === '0' &&
          report.syntheticFixtureVerdict === 'PASS' && validateFixtureBatch(report).length === 0) {
        evidenceState = 'EXPECTED_SYNTHETIC_RECORDS';
      }
    } catch {
      // Keep the inventory for failed/partial evidence; hashing is not acceptance.
    }
  }
  write(join(root,'manifest.json'), {schema:1, scope:'synthetic only', evidenceState, inventoryOnly:true, files});
}
async function run(mode, root) {
  assertDirectory(root);
  if (mode === 'manifest') return manifest(root);
  if (!['synthetic','real'].includes(mode)) throw new Error('unexpected run mode');
  const identity = commitIdentity();
  write(join(root,'checkout.json'), identity);
  if (mode === 'real') {
    write(join(root,'report.json'), realStartGate());
    process.exitCode = 2;
    return;
  }
  const report = await runSuite();
  report.checkout = identity;
  report.syntheticFixtureFailures = validateFixtureBatch(report);
  report.syntheticFixtureVerdict = report.syntheticFixtureFailures.length === 0 ? 'PASS' : 'FAIL';
  write(join(root,'report.json'), report);
  if (report.syntheticFixtureVerdict !== 'PASS') process.exitCode = 1;
}
if (require.main === module) {
  const [mode, directory, ...extra] = process.argv.slice(2);
  if (!directory || extra.length !== 0) throw new Error('expected mode and dedicated output directory');
  run(mode, resolve(directory)).catch(error => { console.error(error); process.exitCode = 1; });
}
module.exports = {manifest, validateFixtureBatch};
