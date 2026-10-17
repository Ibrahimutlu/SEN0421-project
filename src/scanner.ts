import { chromium, type Page } from 'playwright';
import axe from 'axe-core';
import { randomUUID } from 'node:crypto';

declare global {
  interface Window { axe: typeof axe; }
}

export const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function auditPage(page: Page, target: string) {
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async (tags) => {
    return window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
  }, wcagTags);
  const simplify = (items: typeof results.violations) => items.map(item => ({
    id: item.id, impact: item.impact, description: item.description,
    help: item.help, helpUrl: item.helpUrl, tags: item.tags,
    nodes: item.nodes.map(node => ({
      target: node.target, html: node.html, failureSummary: node.failureSummary ?? null
    }))
  }));
  return {
    id: randomUUID(), createdAt: new Date().toISOString(), target,
    standard: 'WCAG 2.1', level: 'AA', engine: { name: 'axe-core', version: axe.version },
    scope: 'Otomatik denetim; tam uygunluk beyanı değildir.',
    summary: {
      violationRules: results.violations.length,
      affectedNodes: results.violations.reduce((count, item) => count + item.nodes.length, 0),
      passedRules: results.passes.length, needsReview: results.incomplete.length
    },
    violations: simplify(results.violations), incomplete: simplify(results.incomplete),
    manualChecks: [
      'Klavye ile tüm işlevlere erişim ve odak sırası',
      'Ekran okuyucu ile anlam, durum ve hata iletileri',
      'Alternatif metinlerin içerikle ilişkisi'
    ]
  };
}

export async function auditHtml(html: string, target = 'yerel-örnek') {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
    await context.route('**/*', route => route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    await page.setContent(html, { waitUntil: 'load', timeout: 15_000 });
    return await auditPage(page, target);
  } finally {
    await browser.close();
  }
}
