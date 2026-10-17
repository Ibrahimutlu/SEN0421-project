import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 4210);
const server = createApp().listen(port, '127.0.0.1', () => {
  console.log(`SDS-09: http://127.0.0.1:${port}`);
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
