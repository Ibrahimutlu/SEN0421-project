import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { auditHtml, auditUrl } from './scanner.js';
import { ScanError, parseTarget } from './network.js';
import { ReportStore } from './store.js';

export function createApp(options: { store?: ReportStore; runUrl?: typeof auditUrl; runHtml?: typeof auditHtml } = {}) {
  const app = express();
  const store = options.store ?? new ReportStore(':memory:');
  app.locals.store = store;
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(req.hostname)) {
      res.status(403).json({ error: 'This application only accepts local requests.' }); return;
    }
    const origin = req.headers.origin;
    if (origin && origin !== `http://${req.headers.host}`) {
      res.status(403).json({ error: 'Cross-origin requests are not allowed.' }); return;
    }
    next();
  });
  app.use(express.json({ limit: '4kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', project: 'SDS-09', schemaVersion: 1 }));
  app.get('/api/progress', async (_req, res) => res.json(JSON.parse(await readFile(new URL('../docs/progress.json', import.meta.url), 'utf8'))));
  app.get('/api/scans', (req, res) => {
    const limit = Number(req.query.limit ?? 20), offset = Number(req.query.offset ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) {
      res.status(400).json({ error: 'Use a limit from 1 to 100 and a non-negative offset.' }); return;
    }
    res.json(store.list(limit, offset));
  });
  app.get('/api/scans/:id', (req, res) => {
    const report = store.get(req.params.id);
    if (!report) { res.status(404).json({ error: 'Scan not found.' }); return; }
    res.json(report);
  });
  let scanning = false;
  app.post(['/api/scans/demo', '/api/scans'], async (req, res) => {
    const demo = req.path.endsWith('/demo');
    if (demo ? !['issues', 'accessible', 'contrast'].includes(req.body?.example) : typeof req.body?.url !== 'string') {
      res.status(400).json({ error: demo ? 'Choose a valid example.' : 'A URL string is required.' }); return;
    }
    try { if (!demo) parseTarget(req.body.url); }
    catch (error) { res.status(400).json({ error: (error as Error).message }); return; }
    if (scanning) { res.status(429).json({ error: 'Wait for the current scan to finish.' }); return; }
    scanning = true;
    const controller = new AbortController();
    const disconnected = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', disconnected);
    try {
      const report = demo
        ? await (options.runHtml ?? auditHtml)(await readFile(new URL(`../fixtures/${req.body.example}.html`, import.meta.url), 'utf8'), `fixture:${req.body.example}`)
        : await (options.runUrl ?? auditUrl)(req.body.url, { signal: controller.signal });
      store.save(report);
      res.status(201).json(report);
    } catch (error) {
      if (!(error instanceof ScanError)) console.error(error);
      res.status(error instanceof ScanError ? error.status : 500).json({ error: error instanceof ScanError ? error.message : 'The scan could not be completed. Check the server log.' });
    } finally {
      res.off('close', disconnected);
      scanning = false;
    }
  });
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
  app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(error.status ?? 500).json({ error: error.status === 413 ? 'The request body is too large.' : 'Invalid request.' });
  });
  return app;
}
