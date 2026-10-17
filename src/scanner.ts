import { chromium, type Page } from 'playwright';
import axe from 'axe-core';
import { randomUUID } from 'node:crypto';
import { collectContrast } from './contrast.js';
import { criteriaForTags } from './standards.js';
import { defaultBudget, fetchPublic, parseTarget, ScanError, type FetchResponse, type Resolver, type Transport } from './network.js';

declare global {
  interface Window { axe: typeof axe; }
}

export const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function auditPage(page: Page, target: string) {
  await page.evaluate(axe.source);
  const results = await page.evaluate(async (tags) => {
    return window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
  }, wcagTags);
  const simplify = (items: typeof results.violations) => items.map(item => ({
    id: item.id, impact: item.impact, description: item.description,
    help: item.help, helpUrl: item.helpUrl, tags: item.tags, criteria: criteriaForTags(item.tags),
    nodes: item.nodes.map(node => ({
      target: node.target, html: node.html, failureSummary: node.failureSummary ?? null,
      checks: [...node.any, ...node.all, ...node.none].map(check => ({ id: check.id, message: check.message, data: check.data }))
    }))
  }));
  return {
    id: randomUUID(), createdAt: new Date().toISOString(), target,
    standard: 'WCAG 2.1', level: 'AA', engine: { name: 'axe-core', version: axe.version },
    scope: 'Automated audit of one page; this is not a full conformance statement.',
    summary: {
      violationRules: results.violations.length,
      affectedNodes: results.violations.reduce((count, item) => count + item.nodes.length, 0),
      passedRules: results.passes.length, needsReview: results.incomplete.length
    },
    violations: simplify(results.violations), incomplete: simplify(results.incomplete),
    contrast: await collectContrast(page),
    manualChecks: [
      'Keyboard access to all functions and logical focus order',
      'Screen reader meaning, states and error announcements',
      'Contextual accuracy of image alternatives'
    ]
  };
}

export async function auditHtml(html: string, target = 'local-fixture') {
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

export type AuditReport = Awaited<ReturnType<typeof auditPage>>;
export type UrlReport = AuditReport & {
  renderingMode: string; finalUrl: string;
  network: { requests: number; bytes: number; blocked: { url: string; reason: string }[]; partial: boolean };
};

export async function auditUrl(input: string, options: { timeoutMs?: number; signal?: AbortSignal; resolver?: Resolver; transport?: Transport } = {}): Promise<UrlReport> {
  const target = parseTarget(input).href;
  const signal = AbortSignal.any([AbortSignal.timeout(options.timeoutMs ?? 30_000), ...(options.signal ? [options.signal] : [])]);
  const budget = defaultBudget();
  const networkOptions = { signal, budget, resolver: options.resolver, transport: options.transport };
  const first = await fetchPublic(target, networkOptions).catch(error => {
    if (signal.aborted) throw new ScanError('The scan exceeded its time limit or was cancelled.', 504);
    if (error instanceof ScanError) throw error;
    throw new ScanError('The target could not be reached or its certificate could not be verified.', 422);
  });
  if (first.status >= 400) throw new ScanError(`The target returned HTTP ${first.status}.`, 422);
  if (!/text\/html|application\/xhtml\+xml/i.test(first.headers['content-type'] ?? '')) {
    throw new ScanError('The target must return an HTML page.', 422);
  }
  const browser = await chromium.launch({ headless: true });
  const abort = () => { void browser.close(); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    signal.throwIfAborted();
    const context = await browser.newContext({
      javaScriptEnabled: true, serviceWorkers: 'block', acceptDownloads: false,
      viewport: { width: 1280, height: 800 }
    });
    await context.routeWebSocket('**/*', socket => socket.close());
    const blocked: { url: string; reason: string }[] = [];
    const page = await context.newPage();
    let initial = true;
    await context.route('**/*', async route => {
      const request = route.request();
      try {
        signal.throwIfAborted();
        if (request.method() !== 'GET' || !['document', 'stylesheet', 'image', 'font'].includes(request.resourceType()) || request.frame() !== page.mainFrame()) {
          throw new ScanError('Scripts, frames, workers and active requests are disabled in static mode.');
        }
        let response: FetchResponse;
        if (initial && request.isNavigationRequest() && request.url() === first.finalUrl) {
          initial = false;
          response = first;
        } else {
          response = await fetchPublic(request.url(), networkOptions);
        }
        const encoding = response.headers['content-encoding'];
        if (encoding && encoding !== 'identity') throw new ScanError('Compressed resources are not supported in static mode.');
        await route.fulfill({ status: response.status, body: response.body,
          headers: { 'content-type': response.headers['content-type'] ?? 'application/octet-stream', 'cache-control': 'no-store',
            'content-security-policy': "script-src 'none'; worker-src 'none'; frame-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" } });
      } catch (error) {
        blocked.push({ url: request.url(), reason: error instanceof Error ? error.message : 'Request blocked.' });
        await route.abort('blockedbyclient').catch(() => {});
      }
    });
    await page.goto(first.finalUrl, { waitUntil: 'load', timeout: 15_000 });
    if (blocked.some(item => item.url === first.finalUrl)) throw new ScanError('The main document could not be rendered.', 422);
    const report = await auditPage(page, target);
    signal.throwIfAborted();
    return { ...report, renderingMode: 'Static HTML and CSS; site JavaScript, frames and authenticated states are excluded.',
      finalUrl: page.url(), network: { requests: budget.requests, bytes: budget.bytes, blocked, partial: blocked.length > 0 } };
  } catch (error) {
    if (signal.aborted) throw new ScanError('The scan exceeded its time limit or was cancelled.', 504);
    if (error instanceof ScanError) throw error;
    throw new ScanError('The page could not be rendered. Check its address and availability.', 422);
  } finally {
    signal.removeEventListener('abort', abort);
    await browser.close();
  }
}
