import { readFile } from 'node:fs/promises';
const progress = JSON.parse(await readFile(new URL('../docs/progress.json', import.meta.url), 'utf8'));
const done = progress.stages.filter(stage => stage.status === 'completed');
console.log(`${progress.project}: ${done.length}/${progress.stages.length} aşama tamamlandı.`);
const next = progress.stages.find(stage => stage.status !== 'completed');
console.log(next ? `Sıradaki: ${next.id}. ${next.title}` : 'Tüm aşamalar tamamlandı.');
console.log(`Çalışma saati: ${progress.dailyTime} (${progress.timezone})`);
