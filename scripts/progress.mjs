import { readFile } from 'node:fs/promises';
const progress = JSON.parse(await readFile(new URL('../docs/progress.json', import.meta.url), 'utf8'));
const done = progress.stages.filter(stage => stage.status === 'completed');
console.log(`${progress.project}: ${done.length}/${progress.stages.length} stages completed.`);
const next = progress.stages.find(stage => stage.status !== 'completed');
console.log(next ? `Next: ${next.id}. ${next.title}` : 'All stages completed.');
console.log(`Daily schedule: ${progress.dailyTime} (${progress.timezone})`);
