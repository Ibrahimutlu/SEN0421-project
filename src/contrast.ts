import { readFile } from 'node:fs/promises';
import type { Page } from 'playwright';

export function contrastRatio(foreground: number[], background: number[]) {
  const luminance = (color: number[]) => color.slice(0, 3).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function minimumRatio(fontSizePx: number, fontWeight: number) {
  return fontSizePx >= 24 || (fontSizePx >= 56 / 3 && fontWeight >= 700) ? 3 : 4.5;
}

export async function collectContrast(page: Page) {
  const samples = await page.evaluate<{
    items: { selector: string; text: string; foreground: number[] | null; background: number[];
      fontSizePx: number; fontWeight: number; reason: string | null; disabled: boolean }[];
    truncated: boolean;
  }>(await readFile(new URL('./contrast-samples.js', import.meta.url), 'utf8'));
  const items = samples.items.map(sample => {
    const requiredRatio = minimumRatio(sample.fontSizePx, sample.fontWeight);
    const ratio = sample.reason || !sample.foreground ? null : contrastRatio(sample.foreground, sample.background);
    const status = sample.disabled ? 'not-applicable' : ratio === null ? 'needs-review' : ratio >= requiredRatio ? 'pass' : 'fail';
    return { ...sample, ratio, requiredRatio, status, criterion: '1.4.3',
      qualification: 'Static color sample; visual and semantic exceptions require human review.' };
  });
  return { items, truncated: samples.truncated, limit: 500, method: 'WCAG relative luminance; opaque solid colors only' };
}
