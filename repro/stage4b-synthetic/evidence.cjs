'use strict';
const {createHash} = require('node:crypto');
const {lstatSync, readdirSync, readFileSync, writeFileSync} = require('node:fs');
const {resolve, join} = require('node:path');
const {execFileSync} = require('node:child_process');
const {realStartGate, runSuite} = require('./coordinator.cjs');
const digest = b => createHash('sha256').update(b).digest('hex');
const exitExpected = new Map([['complete','COMPLETE'],['headers-only','INCOMPLETE'],
  ['late-document','INCOMPLETE'],['malformed','INCOMPLETE'],
  ['worker-error','WORKER_ERROR'],['deadline','INCOMPLETE']]);
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
  write(join(root,'manifest.json'), {schema:1, scope:'synthetic only', files});
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
  report.syntheticFixtureVerdict = report.cases.length === exitExpected.size &&
    report.cases.every(row => exitExpected.get(row.variant) === row.status &&
       (row.variant !== 'deadline' || (row.stop === 'OBSERVATION_DEADLINE' && row.worker.cleanup === 'CONFIRMED'))) ?
    'PASS' : 'FAIL';
  write(join(root,'report.json'), report);
  if (report.syntheticFixtureVerdict !== 'PASS') process.exitCode = 1;
}
if (require.main === module) {
  const [mode, directory, ...extra] = process.argv.slice(2);
  if (!directory || extra.length !== 0) throw new Error('expected mode and dedicated output directory');
  run(mode, resolve(directory)).catch(error => { console.error(error); process.exitCode = 1; });
}
module.exports = {manifest};
