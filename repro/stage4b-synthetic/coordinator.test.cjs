'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const {join} = require('node:path');
const {createHash} = require('node:crypto');
const {runSuite, realStartGate, CAPS, correlate} = require('./coordinator.cjs');
const {manifest, validateFixtureBatch} = require('./evidence.cjs');
test('complete, headers-only, quarantined and worker failure are separate', async () => {
  const r = await runSuite(['complete','headers-only','late-document','malformed','worker-error']);
  assert.deepEqual(r.cases.map(x=>x.status), ['COMPLETE','INCOMPLETE','INCOMPLETE','INCOMPLETE','WORKER_ERROR']);
  for (const row of r.cases) {
    assert.equal(row.attempt,1);
    assert.equal(row.runId,r.runId);
    assert.ok(Buffer.from(row.stdout,'base64').toString().startsWith('synthetic'));
  }
  assert.equal(r.cases[0].evidence.responseBody,1);
  assert.equal(r.cases[1].evidence.responseHeaders,1);
  assert.equal(r.cases[1].evidence.responseBody,0);
  assert.equal(r.cases[2].evidence.quarantined.length,2);
  assert.equal(r.cases[3].evidence.responseBody,0);
  assert.match(Buffer.from(r.cases[4].stderr,'base64').toString(),/planned/);
  assert.equal(r.cases[4].worker.exitCode,1);
});
test('timeout preserves partial evidence; suite exhaustion prevents next variant', async () => {
  const r = await runSuite(['deadline','complete'], {variantMs:1000,suiteMs:1000,cleanupMs:500});
  const [expired, skipped] = r.cases;
  assert.equal(expired.status,'INCOMPLETE');
  assert.equal(expired.stop,'SUITE_DEADLINE');
  assert.equal(expired.worker.cleanup,'CONFIRMED');
  assert.equal(expired.evidence.responseHeaders,1);
  assert.equal(expired.evidence.responseBody,0);
  assert.equal(skipped.status,'NOT_TESTED');
  assert.equal(skipped.attempt,0);
});
test('scope and time caps cannot be bypassed via public input', async () => {
  assert.deepEqual(CAPS,{variantMs:15000,suiteMs:60000,cleanupMs:1000});
  await assert.rejects(runSuite(['complete'],{variantMs:15001}), /invalid upper bound/);
  await assert.rejects(runSuite(['complete'],{suiteMs:60001}), /invalid upper bound/);
  await assert.rejects(runSuite(['complete'],{cleanupMs:1001}), /invalid upper bound/);
  await assert.rejects(runSuite(['complete','complete']),/unique/);
  await assert.rejects(runSuite(['real']),/generated/);
  await assert.rejects(runSuite(['complete'],{scriptPath:'not-allowed'}),/unknown/);
  assert.deepEqual(realStartGate(true),{mode:'real',status:'BLOCKED',started:false,reason:'NO_REAL_ADAPTER',acceptance:'NOT_TESTED'});
});
test('same timestamps and request ID cannot join different identities', () => {
  const bind = {runId:'run', caseId:'case'};
  const p = (kind, extra = {}) => ({...bind, kind, frameId:'frame', documentId:'new', requestId:'same', ...extra});
  const r = correlate([
    p('document'),p('request'),p('headers',{status:200}),p('body',{documentId:'old'}),
    p('body',{frameId:'another'}),p('body',{caseId:'another'}),p('body',{runId:'another'}),
    p('body',{documentId:null}),p('body',{requestId:null}),p('ready')
  ].map((payload,i)=>({hostSeq:i+1,receivedMs:0,payload:{originSeq:i+1,...payload}})),bind);
  assert.equal(r.responseHeaders,1);
  assert.equal(r.responseBody,0);
  assert.equal(r.readyObserved,false);
  assert.equal(r.quarantined.length,7);
});
test('manifest preserves exact bytes, rejects overwrite and non-regular input', t => {
  const base = process.env.TEST_SCRATCH;
  assert.ok(base, 'TEST_SCRATCH must be a dedicated path');
  const root = fs.mkdtempSync(join(base,'receipt-'));
  const file = join(root,'test.stdout');
  const bytes = Buffer.from([0,1,255]);
  fs.writeFileSync(file,bytes,{flag:'wx'});
  manifest(root);
  const target = join(root,'manifest.json'), original = fs.readFileSync(target);
  assert.equal(JSON.parse(original).evidenceState,'PARTIAL');
  assert.equal(JSON.parse(original).inventoryOnly,true);
  assert.deepEqual(JSON.parse(original).files['test.stdout'],{
    size:3,sha256:createHash('sha256').update(bytes).digest('hex')});
  assert.throws(()=>manifest(root),/unchanged/);
  assert.deepEqual(fs.readFileSync(target), original);
  const second = fs.mkdtempSync(join(base,'receipt-'));
  fs.symlinkSync(file,join(second,'link'));
  assert.throws(()=>manifest(second),/regular file/);
});


test('per-variant deadline stops only that fixture after confirmed cleanup', async () => {
  const r = await runSuite(['deadline','complete'], {variantMs:600,suiteMs:3000,cleanupMs:500});
  assert.equal(r.cases[0].stop,'OBSERVATION_DEADLINE');
  assert.equal(r.cases[0].worker.cleanup,'CONFIRMED');
  assert.equal(r.cases[1].status,'COMPLETE');
});


test('absent binding, missing snapshot value and early readiness cannot close evidence', () => {
  assert.throws(() => correlate([], {runId:'run'}), /invalid evidence binding/);
  const binding = {runId:'run', caseId:'case'};
  const data = [
    ['document'], ['snapshot'], ['request','R1'], ['request','R2'], ['headers','R1'],
    ['body','R1'], ['ready'], ['headers','R2'], ['body','R2'],
  ].map(([kind,requestId],i) => ({hostSeq:i+1,payload:{
    ...binding, kind, frameId:'frame', documentId:'document', originSeq:i+1, requestId, status:200,
  }}));
  const result = correlate(data,binding);
  assert.equal(result.responseBody,2);
  assert.equal(result.snapshotObserved,false);
  assert.equal(result.readyObserved,false);
  assert.deepEqual(result.quarantined.map(x=>x.reason),['INVALID_SNAPSHOT_PAYLOAD','INVALID_READY_CHAIN']);
});


test('batch rejects expected INCOMPLETE labels when their raw reasons are missing or wrong', async () => {
  const r = await runSuite(undefined,{variantMs:1000,suiteMs:5000});
  assert.deepEqual(validateFixtureBatch(r), []);
  for (const variant of ['headers-only','late-document','malformed']) {
    const altered = structuredClone(r), row = altered.cases.find(x => x.variant === variant);
    row.receipts = [];
    row.evidence = correlate([],{runId:row.runId,caseId:row.caseId});
    assert.equal(row.status,'INCOMPLETE');
    assert.deepEqual(validateFixtureBatch(altered), [variant + ':RAW_RECEIPT_CHAIN']);
  }
  const altered = structuredClone(r);
  const row = altered.cases.find(x => x.variant === 'late-document');
  row.receipts[4].payload.documentId = 'document-current';
  row.evidence = correlate(row.receipts,{runId:row.runId,caseId:row.caseId});
  assert.ok(validateFixtureBatch(altered).includes('late-document:CORRELATED_EVIDENCE'));
  const wrong = structuredClone(r), h = wrong.cases.find(x => x.variant === 'headers-only');
  h.receipts[3].payload.status = 201;
  assert.deepEqual(validateFixtureBatch(wrong), ['headers-only:RAW_FIXTURE_VALUES']);
});

test('a synchronous constructor failure preserves earlier evidence and blocks further starts', async t => {
  const threads = require('node:worker_threads'), Original = threads.Worker;
  const moduleId = require.resolve('./coordinator.cjs'), saved = require.cache[moduleId];
  let calls = 0;
  const replacement = t.mock.method(threads, 'Worker', function(...args) {
    if (++calls === 2) throw new Error('synthetic constructor refusal');
    return new Original(...args);
  });
  let isolated;
  try {
    delete require.cache[moduleId];
    isolated = require(moduleId);
  } finally { require.cache[moduleId] = saved; }
  try {
    const report = await isolated.runSuite(['complete','headers-only','late-document']);
    assert.equal(calls,2);
    const [previous, refusal, future] = report.cases;
    assert.equal(previous.status,'COMPLETE');
    assert.equal(previous.receipts.length,6);
    assert.equal(refusal.status,'INCOMPLETE');
    assert.equal(refusal.stop,'WORKER_START_FAILED');
    assert.equal(refusal.worker.startup,'CONSTRUCTOR_FAILED');
    assert.equal(refusal.worker.threadId,null);
    assert.equal(refusal.worker.exitCode,null);
    assert.equal(refusal.worker.error,'synthetic constructor refusal');
    assert.equal(future.status,'NOT_TESTED');
    assert.equal(future.stop,'PRIOR_WORKER_START_FAILED');
  } finally { replacement.mock.restore(); }
});


test('termination exception leaves earlier observations and the primary stop intact', async t => {
  const workerPrototype = require('node:worker_threads').Worker.prototype;
  const originalTerminate = workerPrototype.terminate;
  const replacement = t.mock.method(workerPrototype, 'terminate', function() {
    originalTerminate.call(this).catch(() => {});
    throw new Error('synthetic throw after native terminate requested');
  });
  try {
    const report = await runSuite(['complete','deadline','headers-only'], {variantMs:600,suiteMs:3000});
    const [first, row, subsequent] = report.cases;
    assert.equal(first.status,'COMPLETE');
    assert.equal(row.stop,'OBSERVATION_DEADLINE');
    assert.equal(row.status,'INCOMPLETE');
    assert.equal(row.receipts.length,4);
    assert.equal(row.evidence.responseHeaders,1);
    assert.ok(row.worker.threadId>0);
    assert.equal(row.worker.cleanup,'UNCONFIRMED');
    assert.equal(row.worker.cleanupError,'synthetic throw after native terminate requested');
    assert.equal(subsequent.stop,'PRIOR_CLEANUP_UNCONFIRMED');
    assert.equal(subsequent.attempt,0);
  } finally { replacement.mock.restore(); }
});
