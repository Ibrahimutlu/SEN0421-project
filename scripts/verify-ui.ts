import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createApp } from '../src/app.js';
import { auditPage } from '../src/scanner.js';
import { ReportStore } from '../src/store.js';

const store = new ReportStore(':memory:');
const server = createApp({ store }).listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const address = server.address(); assert.ok(address && typeof address !== 'string');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}`);
  await page.getByText(/14 stages completed/).waitFor();
  await page.keyboard.press('Tab'); assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
  const run = async (source: string) => {
    await page.getByLabel('Scan source').selectOption(source);
    await page.getByRole('button', { name: 'Start audit' }).click();
    await page.getByText('Audit completed and saved.', { exact: true }).waitFor({ timeout: 30_000 });
  };
  await run('issues');
  assert.equal(await page.locator('.finding').count(), 5);
  await page.getByLabel('Rule or criterion').fill('1.4.3'); assert.equal(await page.locator('.finding').count(), 1);
  await page.getByLabel('Rule or criterion').fill('');
  await page.getByLabel('Impact', { exact: true }).selectOption('critical'); assert.equal(await page.locator('.finding').count(), 3);
  await page.getByLabel('Impact', { exact: true }).selectOption('all');
  await page.getByLabel('Element or selector').fill('button'); assert.equal(await page.locator('.finding').count(), 1);
  await page.getByLabel('Element or selector').fill('');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download JSON report' }).click();
  assert.ok((await download).suggestedFilename().endsWith('.json'));
  await page.reload(); await page.getByRole('button', { name: 'fixture:issues', exact: false }).click();
  await page.getByText('Saved audit loaded.', { exact: true }).waitFor(); assert.equal(await page.locator('.finding').count(), 5);
  const report = await auditPage(page, 'local-interface'); assert.equal(report.violations.length, 0, JSON.stringify(report.violations));
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/desktop.png', import.meta.url)), fullPage: true });
  await run('accessible'); assert.equal(await page.locator('.finding').count(), 0);
  await run('contrast');
  await page.getByLabel('Finding type').selectOption('incomplete');
  assert.ok((await page.locator('.finding').count()) > 0);
  await page.getByText('Contrast evidence', { exact: true }).click();
  assert.ok((await page.locator('#contrast-body tr').count()) >= 9);
  assert.ok((await page.locator('#contrast-body').textContent())?.includes('needs review'));
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const mobile = await auditPage(page, 'mobile-interface'); assert.equal(mobile.violations.length, 0, JSON.stringify(mobile.violations));
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/mobile.png', import.meta.url)), fullPage: true });
  await page.getByLabel('Scan source').selectOption('url'); await page.getByLabel('Web address').fill('http://127.0.0.1');
  await page.getByRole('button', { name: 'Start audit' }).click();
  await page.getByRole('alert').waitFor(); assert.ok((await page.getByRole('alert').textContent())?.includes('private'));
  assert.deepEqual(errors, []);
  console.log('UI passed: English interface, three audits, rule/impact/element filters, incomplete findings, contrast evidence, history reload, JSON download, private URL rejection, keyboard entry and desktop/mobile accessibility checks.');
} finally {
  await browser.close(); await new Promise<void>(resolve => server.close(() => resolve())); store.close();
}
