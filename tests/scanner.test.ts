import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { auditHtml } from '../src/scanner.js';

test('bilinen hataları bulur, düzeltilmiş örnekte aynı hataları bulmaz', async () => {
  const broken = await auditHtml(await readFile(new URL('../fixtures/issues.html', import.meta.url), 'utf8'));
  const ids = broken.violations.map(item => item.id);
  for (const id of ['html-has-lang', 'image-alt', 'label', 'button-name', 'color-contrast']) {
    assert.ok(ids.includes(id), `${id} bulunmalı`);
  }
  assert.ok(broken.summary.affectedNodes >= 5);
  assert.ok(broken.manualChecks.length > 0);
  assert.equal(broken.standard, 'WCAG 2.1');
  const corrected = await auditHtml(await readFile(new URL('../fixtures/accessible.html', import.meta.url), 'utf8'));
  assert.equal(corrected.violations.length, 0, JSON.stringify(corrected.violations));
});
