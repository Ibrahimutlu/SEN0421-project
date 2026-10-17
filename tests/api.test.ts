import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { ReportStore } from '../src/store.js';
import { createApp } from '../src/app.js';
import { auditHtml, type UrlReport } from '../src/scanner.js';

async function serve(app: ReturnType<typeof createApp>) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  return { base: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>(resolve => server.close(() => resolve())) };
}
const post = (base: string, path: string, body: unknown) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('saved reports survive a database and API restart with pagination and missing IDs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sds09-'));
  const path = join(dir, 'scans.sqlite');
  let store = new ReportStore(path);
  let server = await serve(createApp({ store }));
  try {
    const response = await post(server.base, '/api/scans/demo', { example: 'issues' });
    assert.equal(response.status, 201);
    const report = await response.json();
    assert.equal(report.summary.violationRules, 5);
    await server.close(); store.close();
    store = new ReportStore(path); server = await serve(createApp({ store }));
    const list = await (await fetch(`${server.base}/api/scans?limit=1&offset=0`)).json();
    assert.equal(list.total, 1); assert.equal(list.items[0].id, report.id);
    assert.deepEqual(await (await fetch(`${server.base}/api/scans/${report.id}`)).json(), report);
    assert.equal((await fetch(`${server.base}/api/scans/missing`)).status, 404);
    assert.equal((await fetch(`${server.base}/api/scans?limit=1000`)).status, 400);
    assert.equal((await post(server.base, '/api/scans/demo', { example: '../../AGENTS' })).status, 400);
    assert.equal((await post(server.base, '/api/scans', { url: 'http://127.0.0.1' })).status, 400);
    assert.equal((await fetch(server.base, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
    const hostStatus = await new Promise<number>((resolve, reject) => {
      const request = http.get(server.base, { headers: { Host: 'untrusted.example' } }, response => {
        response.resume(); resolve(response.statusCode ?? 0);
      }); request.on('error', reject);
    });
    assert.equal(hostStatus, 403);
    assert.equal((await fetch(`${server.base}/api/health`)).status, 200);
  } finally { await server.close(); store.close(); await rm(dir, { recursive: true, force: true }); }
});

test('one scan runs at a time and the scan slot is released after completion', async () => {
  const report = await auditHtml('<!doctype html><html lang="en"><title>Test</title><body><main><h1>Test</h1></main></body></html>');
  let release: () => void = () => {};
  const waiting = new Promise<void>(resolve => { release = resolve; });
  let started: () => void = () => {};
  const running = new Promise<void>(resolve => { started = resolve; });
  const store = new ReportStore(':memory:');
  const server = await serve(createApp({ store, runUrl: async () => { started(); await waiting; return { ...report, renderingMode: 'test', finalUrl: 'https://example.org/', network: { requests: 1, bytes: 0, blocked: [], partial: false } } as UrlReport; } }));
  try {
    const pending = post(server.base, '/api/scans', { url: 'https://example.org' }); await running;
    assert.equal((await post(server.base, '/api/scans/demo', { example: 'issues' })).status, 429);
    release(); assert.equal((await pending).status, 201);
    assert.equal((await post(server.base, '/api/scans/demo', { example: 'accessible' })).status, 201);
  } finally { release(); await server.close(); store.close(); }
});

test('future database schema versions are refused without overwriting data', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sds09-schema-')); const path = join(dir, 'future.sqlite');
  try {
    const db = new DatabaseSync(path); db.exec('PRAGMA user_version = 99'); db.close();
    assert.throws(() => new ReportStore(path), /newer/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
