'use strict';
// Issue #18: target WebKit's history/navigation behaviour, not the PR #17 verdict helper.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {webkit} = require(path.resolve('.engine-investigation/driver156/node_modules/playwright'));

function option(name) {
  const found = process.argv.find(value => value.startsWith('--' + name + '='));
  return found ? found.slice(name.length + 3) : null;
}
const binary = option('binary');
const label = option('label');
const output = option('out');
if (!binary || !label || !output)
  throw new Error('Required: --binary=... --label=... --out=...');
if (!fs.existsSync(binary))
  throw new Error('Requested WebKit binary does not exist: ' + binary);

const atlasHtml = fs.readFileSync('atlas-old/prototype/eikyouki/index.html');
const cases = [
  {name: 'minimal-push-reload', kind: 'minimal', operation: 'push', reload: true},
  {name: 'minimal-replace-reload', kind: 'minimal', operation: 'replace', reload: true},
  {name: 'minimal-none-reload', kind: 'minimal', operation: 'none', reload: true},
  {name: 'minimal-push-goto', kind: 'minimal', operation: 'push', reload: false},
  {name: 'atlas-reference-reload-1', kind: 'atlas', reload: true},
  {name: 'atlas-reference-reload-2', kind: 'atlas', reload: true},
  {name: 'atlas-reference-goto', kind: 'atlas', reload: false},
];

const report = {
  schema: 1,
  target: 'WebKit Navigation::initializeForNewWindow, upstream WebKit/WebKit#53102',
  driver: 'playwright@1.56.1',
  requested_binary: path.resolve(binary),
  revision_label: label,
  atlas_source_head: '3e56d13d77048d056e79c6971e6e7d24ad92b4ff',
  started_at: new Date().toISOString(),
  cases: [],
};
fs.mkdirSync(path.dirname(output), {recursive: true});
function persist() {
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}

async function minimal(page, scenario, record) {
  await page.route('http://repro.test/**', route => route.fulfill({
    status: 200, contentType: 'text/html',
    body: '<!doctype html><title>history core</title><p>hi</p>',
  }));
  record('navigate /a');
  await page.goto('http://repro.test/a');
  if (scenario.operation !== 'none') {
    record(scenario.operation + 'State');
    await page.evaluate(kind => {
      if (kind === 'push') history.pushState({}, '', '/a?x=1');
      else history.replaceState({}, '', '/a?x=1');
    }, scenario.operation);
  }
  record(scenario.reload ? 'page.reload' : 'page.goto(current URL)');
  if (scenario.reload) await page.reload();
  else await page.goto(page.url());
  record('navigate /b');
  await page.goto('http://repro.test/b');
  assert.equal(new URL(page.url()).pathname, '/b');
  assert.equal(await page.title(), 'history core');
}

async function atlas(page, scenario, record, origin) {
  record('navigate EK-0119');
  await page.goto(origin + '/atlas#EK-0119');
  assert.equal(await page.locator('#EK-0119').getAttribute('open'), '');
  record('click EK-0120 reference');
  await page.locator('.narrative-reference').filter({hasText: 'EK-0120'}).click();
  assert.equal(new URL(page.url()).hash, '#EK-0120');
  record(scenario.reload ? 'prior page.reload' : 'prior page.goto(current URL)');
  if (scenario.reload) await page.reload();
  else await page.goto(page.url());
  assert.equal(await page.locator('#EK-0120').getAttribute('open'), '');
  record('navigate C05');
  await page.goto(origin + '/atlas#EK-0120-C05');
  record('final C05 page.reload');
  await page.reload();
  assert.equal(await page.locator('#EK-0120').getAttribute('open'), '');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'EK-0120-C05');
}

async function execute(scenario, origin) {
  const entry = {name: scenario.name, status: 'NOT_TESTED', events: [], error: null};
  report.cases.push(entry);
  let browser, context, crashed = false, disconnected = false;
  const record = (event, extra = {}) =>
    entry.events.push({at: new Date().toISOString(), event, ...extra});
  try {
    browser = await webkit.launch({headless: true, executablePath: path.resolve(binary)});
    entry.browser_version = browser.version();
    browser.on('disconnected', () => { disconnected = true; record('browser.disconnected'); });
    context = await browser.newContext({viewport: {width: 390, height: 1000}, reducedMotion: 'no-preference'});
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(15000);
    page.setDefaultTimeout(10000);
    page.on('crash', () => { crashed = true; record('page.crash'); });
    page.on('load', () => record('load'));
    page.on('response', response => {
      if (response.request().isNavigationRequest())
        record('navigation.response', {status: response.status(), url: response.url()});
    });
    page.on('requestfinished', request => {
      if (request.isNavigationRequest()) record('navigation.requestfinished');
    });
    record('browser.launch');
    if (scenario.kind === 'minimal') await minimal(page, scenario, record);
    else await atlas(page, scenario, record, origin);
    entry.status = 'PASS';
  } catch (error) {
    entry.error = String(error && (error.stack || error)).slice(0, 4000);
    record('error', {message: String(error).slice(0, 350)});
    if (crashed || /Page crashed/i.test(entry.error)) entry.status = 'CRASH';
    else if (disconnected || /browser.*(closed|disconnected)/i.test(entry.error)) entry.status = 'DISCONNECTED';
    else if (/Timeout/i.test(entry.error)) entry.status = 'TIMEOUT';
    else entry.status = 'FAIL';
  } finally {
    if (context) {
      try { await context.close(); } catch (error) { record('context.close.error', {message: String(error)}); }
    }
    if (browser) {
      try { await browser.close(); } catch (error) { record('browser.close.error', {message: String(error)}); }
    }
    entry.finished_at = new Date().toISOString();
    persist();
    console.log(JSON.stringify({case: entry.name, browser: label, status: entry.status}));
  }
}

async function main() {
  const server = http.createServer((req, res) => {
    if (new URL(req.url, 'http://localhost').pathname !== '/atlas') {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
    res.end(atlasHtml);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const scenario of cases) await execute(scenario, origin);
  } finally {
    await new Promise(resolve => server.close(resolve));
    report.finished_at = new Date().toISOString();
    persist();
  }
  const counts = report.cases.reduce((out, entry) => {
    out[entry.status] = (out[entry.status] || 0) + 1;
    return out;
  }, {});
  console.log(JSON.stringify({diagnostic_only: true, driver: report.driver, revision_label: label, counts, total: report.cases.length}));
  // A reproduced WebKit defect is recorded as a failure CASE, not a failure to run the investigation.
  // CI is green only when all seven scenarios produced records, regardless of their outcomes.
  if (report.cases.length !== cases.length || report.cases.some(x => x.status === 'NOT_TESTED')) process.exitCode = 2;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
