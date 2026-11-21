/* Standalone, bounded diagnostics. A successful process does NOT mean every browser case passed. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const {finalize, recorder} = require('./verdict.cjs');

const sources = [
  {name: 'old-pushstate', head: '3e56d13d77048d056e79c6971e6e7d24ad92b4ff', directory: 'atlas-old'},
  {name: 'current-document-nav', head: '4fc74a0b6a531397914b16d8d38768ac8107803c', directory: 'atlas-current'},
];
const scenarios = [
  {name: 'direct-clause-reload', attempts: 1},
  {name: 'reference-prior-reload', attempts: 2},
  {name: 'reference-prior-goto-url', attempts: 1},
];
const limited = process.argv.includes('--only-pr17-timeouts');
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
  schema: 2, scope: limited ? 'PR17-timeout-two-attempts' : 'full-comparison', collected_at: new Date().toISOString(), node: process.version,
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
  let caughtError = null;
  let passed = false;
  let closingContext = false;
  const record = recorder(entry);
  const disconnected = () => record('browser.disconnected', {expected: false});
  browser.on('disconnected', disconnected);
  try {
    context = await browser.newContext({viewport: results.viewport, reducedMotion: 'no-preference'});
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(15000);
    page.on('crash', () => record('page.crash'));
    page.on('close', () => record('page.close', {expected: closingContext}));
    page.on('pageerror', e => record('pageerror', {message: String(e.message).slice(0, 300)}));
    page.on('domcontentloaded', () => record('domcontentloaded'));
    page.on('load', () => record('load'));
    page.on('response', response => {
      if (!response.request().isNavigationRequest()) return;
      const forStep = entry.current_step;
      const details = {url: response.url(), status: response.status(), for_step: forStep};
      record('http.response', details);
      response.finished().then(
        () => record('http.body.complete', details),
        error => record('http.body.error', {...details, message: String(error).slice(0, 300)})
      );
    });
    page.on('requestfinished', request => {
      if (request.isNavigationRequest()) record('http.request.finished', {url: request.url()});
    });
    page.on('requestfailed', request => {
      if (request.isNavigationRequest()) record('http.request.failed',
        {url: request.url(), failure: String(request.failure() || '')});
    });
    const base = origin + '/' + source.name;
    async function step(label, action) {
      const stepEntry = {name: label, started_at: new Date().toISOString()};
      entry.steps.push(stepEntry);
      entry.current_step = label;
      record('step.start', {name: label});
      try {
        const value = await action();
        stepEntry.ended_at = new Date().toISOString();
        record('step.end', {name: label});
        return value;
      } catch (e) {
        stepEntry.failed_at = new Date().toISOString();
        record('step.error', {name: label, message: String(e.message || e).slice(0, 300)});
        throw e;
      } finally {
        entry.current_step = null;
      }
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
    passed = true;
  } catch (e) {
    caughtError = e;
    entry.error = String(e && e.stack || e).slice(0, 3000);
    record('exception', {message: String(e.message || e).slice(0, 300)});
  } finally {
    const verdict = await finalize({
      error: caughtError, passed, events: entry.events, record,
      close: async () => {
        if (context) {
          closingContext = true;
          record('context.close.start');
          try {
            await context.close();
            record('context.close.end');
          } catch (e) {
            record('context.close.error', {message: String(e).slice(0, 250)});
          }
        }
      },
    });
    entry.provisional_result = verdict.provisional;
    entry.result = verdict.result;
    entry.observation_window_ms = verdict.observation_window_ms;
    delete entry.current_step;
    browser.off('disconnected', disconnected);
  }
}

async function main() {
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', e => e ? reject(e) : resolve()));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const [engineName, engine] of Object.entries(limited ? {webkit} : {chromium, webkit})) {
      const browser = await engine.launch({headless: true});
      try {
        for (const source of (limited ? sources.filter(s => s.name === 'old-pushstate') : sources))
          for (const scenario of (limited ? scenarios.filter(s => s.name === 'reference-prior-reload') : scenarios))
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
