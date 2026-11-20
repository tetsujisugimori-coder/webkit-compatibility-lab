import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { chromium, webkit } from 'playwright';
import { observeRequest } from './diagnostic.mjs';

const require = createRequire(import.meta.url);
const path = '/fixture.js';
const marker = 'fixtureExecuted';
const prefix = `globalThis.${marker} = true; /*`;
const payload = Buffer.from(prefix.padEnd(94) + '*/');
const splitPayload = Buffer.from(prefix.padEnd(4094) + '*/');
const chunkBytes = 2048;
const hash = data => createHash('sha256').update(data).digest('hex');
const now = () => ({ at: new Date().toISOString(), ms: performance.now() });
const bodyDelayMs = 500;
const deadlineMs = 5_000;
const cases = [
  { kind: 'script', status: 200, expectedTerminal: 'requestfinished', executes: true },
  { kind: 'script', status: 399, expectedTerminal: 'requestfinished', executes: true },
  { kind: 'script', status: 400, expectedTerminal: 'requestfailed', executes: false },
  { kind: 'script', status: 404, expectedTerminal: 'requestfailed', executes: false },
  { kind: 'fetch', status: 404, expectedTerminal: 'requestfinished' },
  { kind: 'script', status: 200, nosniff: true, expectedTerminal: 'requestfinished', executes: true },
  { kind: 'script', status: 404, nosniff: true, expectedTerminal: 'requestfailed', executes: false },
  { kind: 'script', status: 200, nosniff: true, split: true, expectedTerminal: 'requestfinished', executes: true },
  { kind: 'script', status: 404, nosniff: true, split: true, expectedTerminal: 'requestfailed', executes: false },
];

async function runCase(browser, scenario, row) {
  const body = scenario.split ? splitPayload : payload;
  const bodyWindow = Promise.withResolvers();
  const timers = [];
  const server = createServer((request, response) => {
    if (request.url !== path) {
      response.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': 'text/html' });
      response.end('<!doctype html><title>HTTP error timing fixture</title>');
      return;
    }
    const observation = { status: scenario.status, bytes: body.length, ifNoneMatch: request.headers['if-none-match'] ?? null };
    row.server.push(observation);
    response.once('finish', () => { observation.finished = now(); });
    response.once('close', () => { observation.closed = now(); });
    const headers = {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/javascript',
      'Content-Length': body.length,
    };
    if (scenario.nosniff) headers['X-Content-Type-Options'] = 'nosniff';
    response.writeHead(scenario.status, headers);
    observation.headers = now();
    response.flushHeaders();
    timers.push(setTimeout(() => {
      observation.bodyGate = now();
      observation.connectionOpenAtGate = !response.destroyed;
      if (scenario.split && observation.connectionOpenAtGate) {
        observation.firstChunkWrite = now();
        response.write(body.subarray(0, chunkBytes));
      }
      const sendFinalBytes = () => {
        observation.finalGate = now();
        if (!response.destroyed) {
          observation.finalWrite = now();
          response.end(scenario.split ? body.subarray(chunkBytes) : body);
        }
        bodyWindow.resolve();
      };
      if (scenario.split) timers.push(setTimeout(sendFinalBytes, bodyDelayMs));
      else sendFinalBytes();
    }, bodyDelayMs));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let context;
  let eventDeadline;
  let diagnostic;
  try {
    context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin, { timeout: deadlineMs });
    diagnostic = observeRequest(page, request => request.url() === origin + path && request.resourceType() === scenario.kind, { deadlineMs });
    page.on('response', response => {
      if (diagnostic.matches(response.request())) row.response = { status: response.status(), ...now() };
    });
    const action = page.evaluate(async ({ kind, path, marker }) => {
      if (kind === 'fetch') {
        const response = await fetch(path);
        return { status: response.status, ok: response.ok, bytes: [...new Uint8Array(await response.arrayBuffer())] };
      }
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = path;
        for (const event of ['load', 'error']) {
          script.addEventListener(event, () => resolve({ event, executed: globalThis[marker] === true }), { once: true });
        }
        document.head.append(script);
      });
    }, { kind: scenario.kind, path, marker }).then(result => {
      if (scenario.kind === 'fetch') {
        const body = Buffer.from(result.bytes);
        result.bytes = body.length;
        result.sha256 = hash(body);
      }
      row.page = { ...result, ...now() };
    });
    const terminal = diagnostic.done.then(result => { row.terminal = result; });
    const timeout = new Promise((_, reject) => {
      eventDeadline = setTimeout(() => reject(new Error('page or server observation timed out')), deadlineMs + bodyDelayMs);
    });
    await Promise.race([Promise.all([action, terminal, bodyWindow.promise]), timeout]);
    row.beforeContextClose = now();
    const [observed] = row.server;
    assert.equal(row.server.length, 1);
    assert.equal(observed.ifNoneMatch, null);
    assert.equal(row.response?.status, scenario.status);
    assert.equal(row.terminal.via, scenario.expectedTerminal);
    assert.ok(observed.headers.ms <= row.response.ms && row.response.ms <= row.terminal.ms);
    assert.ok(row.terminal.ms < row.beforeContextClose.ms);
    row.beforeBodyGate = {
      response: row.response.ms < observed.bodyGate.ms,
      terminal: row.terminal.ms < observed.bodyGate.ms,
      page: row.page.ms < observed.bodyGate.ms,
    };
    row.beforeFinalGate = {
      response: row.response.ms < observed.finalGate.ms,
      terminal: row.terminal.ms < observed.finalGate.ms,
      page: row.page.ms < observed.finalGate.ms,
    };
    if (scenario.expectedTerminal === 'requestfinished') {
      assert.ok(observed.finalWrite && row.terminal.ms >= observed.finalWrite.ms, 'completion requires the delayed body');
    }
    if (scenario.kind === 'fetch') {
      assert.deepEqual({ status: row.page.status, ok: row.page.ok, bytes: row.page.bytes, sha256: row.page.sha256 },
        { status: 404, ok: false, bytes: payload.length, sha256: hash(payload) });
    } else {
      assert.deepEqual({ event: row.page.event, executed: row.page.executed },
        { event: scenario.executes ? 'load' : 'error', executed: scenario.executes });
    }
  } finally {
    clearTimeout(eventDeadline);
    diagnostic?.dispose();
    timers.forEach(clearTimeout);
    try {
      await context?.close();
    } finally {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  }
}

const selected = process.argv.slice(2);
const engines = { chromium, webkit };
assert.ok(selected.every(name => Object.hasOwn(engines, name)), 'pass chromium or webkit only');
const report = {
  started: now(), node: process.version, platform: process.platform, arch: process.arch,
  playwright: require('playwright/package.json').version, bodyDelayMs, deadlineMs,
  payload: { bytes: payload.length, sha256: hash(payload) },
  splitPayload: { bytes: splitPayload.length, chunkBytes, sha256: hash(splitPayload) }, rows: [],
};
for (const [engine, type] of Object.entries(engines)) {
  if (selected.length && !selected.includes(engine)) continue;
  let browser;
  try {
    browser = await type.launch({ timeout: 10_000 });
  } catch (error) {
    report.rows.push({ engine, result: 'NOT_TESTED', error: error.message });
    continue;
  }
  try {
    for (const scenario of cases) {
      const row = { engine, browserVersion: browser.version(), nosniff: false, split: false, ...scenario, server: [], result: 'FAIL' };
      report.rows.push(row);
      try {
        await runCase(browser, scenario, row);
        row.result = 'PASS';
      } catch (error) {
        row.error = error.message;
      }
    }
  } finally {
    await browser.close();
  }
}
console.log(JSON.stringify(report, null, 2));
if (report.rows.some(row => row.result !== 'PASS')) process.exitCode = 1;
