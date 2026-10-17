import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { contrastRatio, minimumRatio } from '../src/contrast.js';
import { auditHtml } from '../src/scanner.js';

test('WCAG luminance and exact size boundaries use unrounded values', () => {
  assert.equal(contrastRatio([0, 0, 0], [255, 255, 255]), 21);
  assert.equal(contrastRatio([255, 255, 255], [255, 255, 255]), 1);
  const gray = contrastRatio([119, 119, 119], [255, 255, 255]);
  assert.ok(gray > 4.47 && gray < 4.5);
  assert.equal(minimumRatio(24, 400), 3);
  assert.equal(minimumRatio(23.99, 400), 4.5);
  assert.equal(minimumRatio(56 / 3, 700), 3);
  assert.equal(minimumRatio(18.66, 700), 4.5);
});

test('contrast evidence distinguishes normal, large, disabled and uncertain text', async () => {
  const report = await auditHtml(await readFile(new URL('../fixtures/contrast.html', import.meta.url), 'utf8'));
  const get = (id: string) => report.contrast.items.find(item => item.selector === `#${id}`)!;
  assert.equal(get('normal-pass').ratio, 21);
  assert.equal(get('normal-fail').status, 'fail');
  assert.equal(get('large-pass').status, 'pass');
  assert.equal(get('bold-pass').requiredRatio, 3);
  assert.equal(get('bold-small').requiredRatio, 4.5);
  for (const id of ['gradient', 'transparent', 'alpha']) {
    assert.equal(get(id).status, 'needs-review'); assert.equal(get(id).ratio, null); assert.ok(get(id).reason);
  }
  assert.equal(get('disabled').status, 'not-applicable');
});
