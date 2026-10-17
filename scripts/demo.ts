import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { auditHtml } from '../src/scanner.js';
const html = await readFile(new URL('../fixtures/issues.html', import.meta.url), 'utf8');
const report = await auditHtml(html, 'fixture:issues');
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/demo-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`${report.summary.violationRules} rule violations, ${report.summary.affectedNodes} affected elements.`);
console.log('Report: artifacts/demo-report.json');
