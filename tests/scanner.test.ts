import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { auditHtml, auditUrl } from '../src/scanner.js';
import type { Transport } from '../src/network.js';

test('known issues are detected and the corrected fixture has no automatic violations', async () => {
  const broken = await auditHtml(await readFile(new URL('../fixtures/issues.html', import.meta.url), 'utf8'));
  const ids = broken.violations.map(item => item.id);
  for (const id of ['html-has-lang', 'image-alt', 'label', 'button-name', 'color-contrast']) assert.ok(ids.includes(id), id);
  assert.ok(broken.summary.affectedNodes >= 5);
  assert.ok(broken.manualChecks.length > 0);
  assert.ok(broken.violations.find(item => item.id === 'color-contrast')?.criteria.some(item => item.code === '1.4.3'));
  const corrected = await auditHtml(await readFile(new URL('../fixtures/accessible.html', import.meta.url), 'utf8'));
  assert.equal(corrected.violations.length, 0, JSON.stringify(corrected.violations));
});

test('static URL scan intercepts private subresources and excludes page scripts', async () => {
  const calls: string[] = [];
  const transport: Transport = async target => {
    calls.push(target.url.href);
    return { status: 200, headers: { 'content-type': 'text/html' }, body: Buffer.from(`<!doctype html><html lang="en"><head><title>Network test</title><link rel="stylesheet" href="http://127.0.0.1/private.css"></head><body><main><h1>Static test</h1><img src="http://169.254.169.254/metadata" alt=""><script>document.body.innerHTML='Executed'</script><button></button></main></body></html>`) };
  };
  const report = await auditUrl('https://public.example.org/', { resolver: async () => [{ address: '93.184.216.34', family: 4 }], transport });
  assert.equal(calls.length, 1);
  assert.equal(report.network.partial, true);
  assert.ok(report.network.blocked.some(item => item.url.includes('169.254.169.254')));
  assert.ok(report.network.blocked.some(item => item.url.includes('127.0.0.1')));
  assert.ok(report.violations.some(item => item.id === 'button-name'));
});

test('a scan deadline interrupts DNS resolution', async () => {
  await assert.rejects(auditUrl('https://slow.example.org', { timeoutMs: 50, resolver: () => new Promise(() => {}) }), /time limit/);
});
