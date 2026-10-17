import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createApp } from '../src/app.js';
import { auditPage } from '../src/scanner.js';

const server = createApp().listen(0, '127.0.0.1');
await new Promise<void>(resolve => server.once('listening', resolve));
const address = server.address();
assert.ok(address && typeof address !== 'string');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, bypassCSP: true });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}`);
  await page.getByText(/14 aşama tamamlandı/).waitFor();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').textContent(), 'İçeriğe geç');
  await page.getByRole('button', { name: 'Denetimi başlat' }).click();
  await page.getByText('Denetim tamamlandı.', { exact: true }).waitFor({ timeout: 30_000 });
  assert.ok((await page.locator('.finding').count()) >= 5);
  const report = await auditPage(page, 'yerel-arayüz');
  assert.equal(report.violations.length, 0, JSON.stringify(report.violations));
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/desktop.png', import.meta.url)), fullPage: true });
  await page.getByLabel('Test sayfası').selectOption('accessible');
  await page.getByRole('button', { name: 'Denetimi başlat' }).click();
  await page.getByText('Denetim tamamlandı.', { exact: true }).waitFor({ timeout: 30_000 });
  assert.equal(await page.locator('.finding').count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/mobile.png', import.meta.url)), fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Arayüz: iki tarama, klavye başlangıcı, WCAG otomatik denetimi ve mobil taşma kontrolü geçti.');
} finally {
  await browser.close();
  await new Promise<void>(resolve => server.close(() => resolve()));
}
