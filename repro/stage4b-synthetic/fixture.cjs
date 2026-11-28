'use strict';
// Closed, generated fixtures, not an adapter for a browser or an external process.
const {parentPort, workerData: {variant, runId, caseId}} = require('node:worker_threads');

process.stdout.write('synthetic fixture ' + variant + '\n');
if (variant === 'worker-error') process.stderr.write('planned synthetic fault\n');
let originSeq = 0;
const document = {frameId: 'frame-1', documentId: 'document-current'};
const former = {frameId: 'frame-1', documentId: 'document-former'};
const emit = (kind, fields = {}, identity = document) =>
  parentPort.postMessage({runId, caseId, originSeq: ++originSeq, ...identity, kind, ...fields});
emit('document');
emit('snapshot', {value: {status: 'SYNTHETIC', marker: 'fixture-state'}});
emit('request', {requestId: 'request-1'});
emit('headers', {requestId: 'request-1', status: 200});
switch (variant) {
  case 'complete':
    emit('body', {requestId: 'request-1'}); emit('ready'); break;
  case 'headers-only':
    break;
  case 'late-document':
    emit('body', {requestId: 'request-1'}, former); emit('ready', {}, former); break;
  case 'malformed':
    emit('body', {requestId: 'request-1', caseId: 'unrelated'}); emit('ready'); break;
  case 'worker-error':
    throw new Error('intentional synthetic worker fault');
  case 'deadline':
    setInterval(() => {}, 1000); break;
  default:
    throw new Error('variant input rejected');
}
