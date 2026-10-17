import { auditUrl } from '../src/scanner.js';
import { mkdir, writeFile } from 'node:fs/promises';
const report = await auditUrl('https://example.com');
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/public-url-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ target: report.target, finalUrl: report.finalUrl, summary: report.summary, network: report.network }));
