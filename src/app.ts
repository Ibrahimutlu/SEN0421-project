import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { auditHtml } from './scanner.js';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    next();
  });
  app.use(express.json({ limit: '4kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', project: 'SDS-09' }));
  app.get('/api/progress', async (_req, res) => {
    res.json(JSON.parse(await readFile(new URL('../docs/progress.json', import.meta.url), 'utf8')));
  });
  let scanning = false;
  app.post('/api/scans/demo', async (req, res) => {
    const example = req.body?.example;
    if (example !== 'issues' && example !== 'accessible') {
      res.status(400).json({ error: 'Örnek issues veya accessible olmalı.' });
      return;
    }
    if (scanning) {
      res.status(429).json({ error: 'Devam eden taramanın tamamlanmasını bekleyin.' });
      return;
    }
    scanning = true;
    try {
      const html = await readFile(new URL(`../fixtures/${example}.html`, import.meta.url), 'utf8');
      res.json(await auditHtml(html, `örnek:${example}`));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Tarama tamamlanamadı. Tarayıcı kurulumunu ve sunucu kaydını kontrol edin.' });
    } finally {
      scanning = false;
    }
  });
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
  return app;
}
