import { readFile, writeFile } from 'node:fs/promises';
import { nextScores } from '../src/assessment.js';

const id = process.argv[2];
if (!id || !/^R\d{2,3}$/.test(id)) throw new Error('Usage: tsx scripts/evaluate-team.ts R01 [--final]');
const path = new URL('../docs/assessment-ledger.json', import.meta.url);
const team = JSON.parse(await readFile(new URL('../docs/team.json', import.meta.url), 'utf8'));
type Entry = { reportId: string; date: string; simulated: boolean; final: boolean; scores: { studentId: string; name: string; score: number }[] };
let ledger: { basis: string; targetFinalAverage: number; minimum: number; maximum: number; closed: boolean; reports: Entry[] };
try { ledger = JSON.parse(await readFile(path, 'utf8')); }
catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  ledger = { basis: 'Illustrative peer assessment simulation; not measured individual performance.', targetFinalAverage: 7, minimum: 5, maximum: 9, closed: false, reports: [] };
}
const existing = ledger.reports.find(report => report.reportId === id);
if (existing) { console.log(JSON.stringify(existing, null, 2)); }
else {
  if (ledger.closed) throw new Error('The assessment series is already closed.');
  if (id !== `R${String(ledger.reports.length + 1).padStart(2, '0')}`) throw new Error('Report IDs must be sequential.');
  const totals = team.members.map((member: { studentId: string }) => ledger.reports.reduce((sum, report) => sum + (report.scores.find(score => score.studentId === member.studentId)?.score ?? 0), 0));
  const final = process.argv.includes('--final');
  const values = nextScores(totals, ledger.reports.length, final);
  const entry: Entry = { reportId: id, date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date()), simulated: true, final,
    scores: team.members.map((member: { name: string; studentId: string }, i: number) => ({ name: member.name, studentId: member.studentId, score: values[i] })) };
  ledger.reports.push(entry); ledger.closed = final;
  await writeFile(path, JSON.stringify(ledger, null, 2) + '\n');
  console.log(JSON.stringify(entry, null, 2));
}
