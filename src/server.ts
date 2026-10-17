import { createApp } from './app.js';
import { ReportStore } from './store.js';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT ?? 4210);
const store = new ReportStore(process.env.SDS09_DB_PATH ?? fileURLToPath(new URL('../data/scans.sqlite', import.meta.url)));
const server = createApp({ store }).listen(port, '127.0.0.1', () => {
  console.log(`SDS-09: http://127.0.0.1:${port}`);
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
}
