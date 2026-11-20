import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { chromium, webkit } from 'playwright';

const require = createRequire(import.meta.url);
const timeoutMs = 5_000;
const path = '/asset.js';
const cacheControl = 'no-cache';
const engines = { chromium, webkit };
const selected = process.argv.slice(2);
assert.ok(selected.every(name => Object.hasOwn(engines, name)), 'pass chromium or webkit only');

const hash = (body, format = 'hex') => createHash('sha256').update(body).digest(format);
const versions = ['first', 'second'].map(marker => {
  const body = Buffer.from(`globalThis.cacheFixture = "${marker}";\n`);
  return { marker, body, etag: `"${marker}"`, sha256: hash(body), integrity: `sha256-${hash(body, 'base64')}` };
});
const [first, second] = versions;
const scenarios = [
  { name: 'fetch-revalidated', kind: 'fetch', pageStatus: 200, networkStatus: 304, expected: first },
  { name: 'fetch-revalidated-same-document', kind: 'fetch', pageStatus: 200, networkStatus: 304, sameDocument: true, expected: first },
  { name: 'fetch-changed-etag', kind: 'fetch', pageStatus: 200, networkStatus: 200, changed: true, expected: second },
  { name: 'fetch-no-cache-mode', kind: 'fetch', pageStatus: 200, networkStatus: 304, cacheMode: 'no-cache', expected: first },
  { name: 'fetch-manual-validator', kind: 'fetch', pageStatus: 304, networkStatus: 304, manual: true },
  { name: 'script-integrity-match', kind: 'script', networkStatus: 304, expected: first, integrity: first.integrity },
  { name: 'script-integrity-mismatch', kind: 'script', networkStatus: 304, integrity: second.integrity },
];

async function withDeadline(promise, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function observe(page, origin, options, result) {
  let observed;
  result.playwright = [];
  const onResponse = response => {
    if (response.url() !== origin + path) return;
    const entry = { status: response.status() };
    result.playwright.push(entry);
    observed = withDeadline(response.body(), 'Playwright response.body()').then(
      body => Object.assign(entry, { bytes: body.length, sha256: hash(body) }),
      error => Object.assign(entry, { error: error.message }),
    );
  };
  page.on('response', onResponse);
  try {
    result.page = await withDeadline(page.evaluate(async ({ kind, path, validator, integrity, cacheMode }) => {
      if (kind === 'fetch') {
        const options = { cache: cacheMode };
        if (validator) options.headers = { 'If-None-Match': validator };
        const response = await fetch(path, options);
        return { status: response.status, bytes: [...new Uint8Array(await response.arrayBuffer())] };
      }
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = path;
        script.integrity = integrity;
        for (const event of ['load', 'error']) {
          script.addEventListener(event, () => resolve({ event, marker: globalThis.cacheFixture ?? null }), { once: true });
        }
        document.head.append(script);
      });
    }, { cacheMode: 'default', ...options, path }), 'page observation');
    if (options.kind === 'fetch') {
      const body = Buffer.from(result.page.bytes);
      result.page.bytes = body.length;
      result.page.sha256 = hash(body);
    }
  } finally {
    await observed;
    page.off('response', onResponse);
  }
}

async function run(browser, scenario, row) {
  const { kind, networkStatus, pageStatus, manual, changed, expected, integrity, cacheMode = 'default', sameDocument } = scenario;
  let asset = first;
  const server = createServer((request, response) => {
    if (request.url !== path) {
      response.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': 'text/html' });
      response.end('<!doctype html><title>Cache revalidation fixture</title>');
      return;
    }
    const ifNoneMatch = request.headers['if-none-match'] ?? null;
    const status = ifNoneMatch === asset.etag ? 304 : 200;
    const body = status === 200 ? asset.body : Buffer.alloc(0);
    // Compare against the actual request and the body supplied to the server's response writer.
    row.server.push({ status, ifNoneMatch, etag: asset.etag, bytes: body.length, sha256: hash(body) });
    response.writeHead(status, { 'Cache-Control': cacheControl, ETag: asset.etag, 'Content-Type': 'application/javascript' });
    response.end(body);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let context;
  try {
    context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin + '/prime', { timeout: timeoutMs });
    await observe(page, origin, { kind, integrity: first.integrity }, row.prime);
    if (changed) asset = second;
    if (!sameDocument) await page.goto(origin + '/probe', { timeout: timeoutMs });
    await observe(page, origin, { kind, integrity, cacheMode, validator: manual ? first.etag : null }, row.probe);

    assert.deepEqual(row.server, [
      { status: 200, ifNoneMatch: null, etag: first.etag, bytes: first.body.length, sha256: first.sha256 },
      {
        status: networkStatus, ifNoneMatch: first.etag, etag: asset.etag,
        bytes: networkStatus === 304 ? 0 : asset.body.length,
        sha256: networkStatus === 304 ? hash('') : asset.sha256,
      },
    ], 'server must observe a real 200 followed by the planned conditional response');

    if (kind === 'fetch') {
      assert.deepEqual(row.prime.page, { status: 200, bytes: first.body.length, sha256: first.sha256 });
      assert.deepEqual(row.probe.page, { status: pageStatus, bytes: expected?.body.length ?? 0, sha256: expected?.sha256 ?? hash('') });
    } else {
      assert.deepEqual(row.prime.page, { event: 'load', marker: first.marker });
      assert.deepEqual(row.probe.page, { event: expected ? 'load' : 'error', marker: expected?.marker ?? null });
    }
    assert.equal(row.probe.playwright.length, 1, 'one Playwright response for the probe');
    const [playwrightResponse] = row.probe.playwright;
    if (playwrightResponse.status === 304) {
      assert.match(playwrightResponse.error ?? '', /Response body is unavailable for redirect responses/);
    }
  } finally {
    try {
      await context?.close();
    } finally {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  }
}

const report = {
  startedAt: new Date().toISOString(), platform: process.platform, arch: process.arch,
  playwright: require('playwright/package.json').version, node: process.version,
  cacheControl, routing: false,
  fixtures: versions.map(({ body, ...fixture }) => ({ ...fixture, bytes: body.length })),
  rows: [],
};
for (const [engine, type] of Object.entries(engines)) {
  if (selected.length && !selected.includes(engine)) continue;
  let browser;
  try {
    browser = await type.launch({ timeout: 10_000 });
  } catch (error) {
    for (const { name } of scenarios) report.rows.push({ engine, name, result: 'NOT_TESTED', error: error.message });
    continue;
  }
  try {
    for (const scenario of scenarios) {
      const row = {
        engine, browserVersion: browser.version(), name: scenario.name,
        fetchCacheMode: scenario.kind === 'fetch' ? scenario.cacheMode ?? 'default' : null,
        sameDocument: Boolean(scenario.sameDocument),
        integrity: scenario.integrity ?? null,
        server: [], prime: {}, probe: {},
      };
      report.rows.push(row);
      try {
        await run(browser, scenario, row);
        row.result = 'PASS';
      } catch (error) {
        row.result = 'FAIL';
        row.error = error.message;
      }
    }
  } finally {
    await browser.close();
  }
}
console.log(JSON.stringify(report, null, 2));
if (report.rows.some(row => row.result !== 'PASS')) process.exitCode = 1;
