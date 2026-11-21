/* Standalone, bounded diagnostics. A successful process does NOT mean every browser case passed. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');

const sources = [
  {name: 'old-pushstate', head: '3e56d13d77048d056e79c6971e6e7d24ad92b4ff', directory: 'atlas-old'},
  {name: 'current-document-nav', head: '4fc74a0b6a531397914b16d8d38768ac8107803c', directory: 'atlas-current'},
];
const scenarios = [
  {name: 'direct-clause-reload', attempts: 1},
  {name: 'reference-prior-reload', attempts: 2},
  {name: 'reference-prior-goto-url', attempts: 1},
];
const out = path.resolve(process.argv[2] || 'evidence/atlas-history');
fs.mkdirSync(out, {recursive: true});
const sourceHtml = new Map();
const sourceHashes = {};
for (const source of sources) {
  const file = path.resolve(source.directory, 'prototype/eikyouki/index.html');
  const html = fs.readFileSync(file);
  sourceHtml.set(source.name, html);
  sourceHashes[source.name] = crypto.createHash('sha256').update(html).digest('hex');
}
const results = {
  schema: 1, collected_at: new Date().toISOString(), node: process.version,
  platform: process.platform, playwright: require('playwright/package.json').version,
  sources: sources.map(s => ({name: s.name, head: s.head, html_sha256: sourceHashes[s.name]})),
  viewport: {width: 390, height: 1000}, reduced_motion: 'no-preference',
  cases: [],
};
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname.slice(1));
  const html = sourceHtml.get(name);
  if (!html) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('not found');
    return;
  }
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
  res.end(html);
});

async function executeCase(browser, engineName, source, scenario, attempt, origin) {
  const entry = {
    engine: engineName, browser_version: browser.version(), source: source.name,
    source_head: source.head, scenario: scenario.name, attempt,
    steps: [], events: [], result: 'INCOMPLETE', error: null,
  };
  results.cases.push(entry);
  let context;
  let crashed = false;
  try {
    context = await browser.newContext({viewport: results.viewport, reducedMotion: 'no-preference'});
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(15000);
    page.on('crash', () => {crashed = true; entry.events.push('page.crash');});
    page.on('pageerror', e => entry.events.push('pageerror:' + e.message));
    const base = origin + '/' + source.name;
    async function step(label, action) {
      entry.steps.push({name: label, started_at: new Date().toISOString()});
      const value = await action();
      entry.steps[entry.steps.length - 1].ended_at = new Date().toISOString();
      return value;
    }
    if (scenario.name === 'direct-clause-reload') {
      await step('direct C05 navigate', () => page.goto(base + '#EK-0120-C05'));
    } else {
      await step('direct EK-0119 navigate', () => page.goto(base + '#EK-0119'));
      assert.equal(await page.locator('#EK-0119').getAttribute('open'), '');
      await step('click EK-0120 reference', () => page.locator('.narrative-reference').filter({hasText: 'EK-0120'}).click());
      assert.equal(new URL(page.url()).hash, '#EK-0120');
      entry.steps.push({name: 'reference url', value: page.url()});
      if (scenario.name === 'reference-prior-goto-url') {
        await step('prior goto current URL instead of reload', () => page.goto(page.url()));
      } else {
        await step('prior page.reload', () => page.reload());
      }
      assert.equal(await page.locator('#EK-0120').getAttribute('open'), '');
      await step('navigate C05', () => page.goto(base + '#EK-0120-C05'));
    }
    await step('final C05 page.reload', () => page.reload());
    assert.equal(await page.locator('#EK-0120').getAttribute('open'), '');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'EK-0120-C05');
    entry.final_url = page.url();
    entry.result = 'PASS';
  } catch (e) {
    const message = String(e && e.stack || e);
    entry.error = message.slice(0, 3000);
    entry.result = crashed || /Page crashed|Target page.*crashed|page\.crash/i.test(message)
      ? 'CRASH'
      : /Timeout|timed out/i.test(message) ? 'TIMEOUT' : 'FAIL';
  } finally {
    if (context) {
      try {await context.close();} catch (e) {entry.events.push('context.close:' + String(e).slice(0, 250));}
    }
  }
}

async function main() {
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', e => e ? reject(e) : resolve()));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const [engineName, engine] of Object.entries({chromium, webkit})) {
      const browser = await engine.launch({headless: true});
      try {
        for (const source of sources)
          for (const scenario of scenarios)
            for (let i = 1; i <= scenario.attempts; i++)
              await executeCase(browser, engineName, source, scenario, i, origin);
      } finally {
        await browser.close();
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    results.finished_at = new Date().toISOString();
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
    const counts = results.cases.reduce((a, c) => (a[c.result] = (a[c.result] || 0) + 1, a), {});
    console.log(JSON.stringify({diagnostic_only: true, playwright: results.playwright, counts, cases: results.cases.length}));
  }
}
main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
