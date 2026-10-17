import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('sunucu çalışır; dosya yolu ve geçersiz örnek isteklerini reddeder', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal((await (await fetch(`${base}/api/health`)).json()).status, 'ok');
    const response = await fetch(`${base}/api/scans/demo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ example: '../../AGENTS' })
    });
    assert.equal(response.status, 400);
    assert.equal((await fetch(base)).status, 200);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
