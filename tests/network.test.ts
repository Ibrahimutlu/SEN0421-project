import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { defaultBudget, fetchPublic, isPublicAddress, parseTarget, requestPinned, validateTarget, type Transport } from '../src/network.js';

const resolver = async () => [{ address: '93.184.216.34', family: 4 }];
const ok: Transport = async () => ({ status: 200, headers: { 'content-type': 'text/html' }, body: Buffer.from('ok') });

test('private, loopback, reserved, mapped and unusual IP forms are blocked', async () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '192.0.2.1', '::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '2001:db8::1']) assert.equal(isPublicAddress(ip), false, ip);
  for (const url of ['http://127.1', 'http://2130706433', 'http://0x7f000001', 'http://[::1]', 'http://[::ffff:127.0.0.1]']) await assert.rejects(validateTarget(url), /private/);
  for (const url of ['file:///etc/passwd', 'ftp://example.org', 'https://a:b@example.org', 'http://localhost', 'https://example.org:444', 'http://printer.local']) assert.throws(() => parseTarget(url));
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
});

test('mixed DNS responses and redirects into internal networks are rejected', async () => {
  await assert.rejects(validateTarget('https://example.org', async () => [...await resolver(), { address: '127.0.0.1', family: 4 }]), /private/);
  let calls = 0;
  await assert.rejects(fetchPublic('https://example.org', { resolver, transport: async () => {
    calls++; return { status: 302, headers: { location: 'http://169.254.169.254/' }, body: Buffer.alloc(0) };
  } }), /private/);
  assert.equal(calls, 1);
});

test('validated addresses are pinned and rebound DNS answers are rejected on the next hop', async () => {
  let resolutions = 0, calls = 0;
  await assert.rejects(fetchPublic('https://example.org/', {
    resolver: async () => ++resolutions === 1 ? await resolver() : [{ address: '10.0.0.1', family: 4 }],
    transport: async target => {
      calls++; assert.equal(target.address, '93.184.216.34');
      return { status: 302, headers: { location: '/again' }, body: Buffer.alloc(0) };
    }
  }), /private/);
  assert.equal(calls, 1); assert.equal(resolutions, 2);
});

test('redirect, request and byte budgets are enforced', async () => {
  await assert.rejects(fetchPublic('https://example.org', { resolver, transport: async () => ({ status: 302, headers: { location: '/' }, body: Buffer.alloc(0) }) }), /four redirects/);
  const budget = defaultBudget(); budget.maxRequests = 0;
  await assert.rejects(fetchPublic('https://example.org', { resolver, transport: ok, budget }), /budget/);
  await assert.rejects(fetchPublic('https://example.org', { resolver, transport: async () => ({ status: 200, headers: {}, body: Buffer.alloc(2 * 1024 * 1024 + 1) }) }), /size limit/);
  const shared = defaultBudget(); shared.maxBytes = 100;
  const streaming: Transport = async (_target, _signal, _limit, onBytes) => {
    onBytes?.(60); await new Promise(resolve => setTimeout(resolve, 5));
    return { status: 200, headers: {}, body: Buffer.alloc(60) };
  };
  const outcomes = await Promise.allSettled([
    fetchPublic('https://example.org/a', { resolver, transport: streaming, budget: shared }),
    fetchPublic('https://example.org/b', { resolver, transport: streaming, budget: shared })
  ]);
  assert.equal(outcomes.filter(item => item.status === 'rejected').length, 2);
});

test('the transport connects to the pinned socket address and preserves the Host header', async () => {
  const server = http.createServer((req, res) => { res.end(JSON.stringify({ host: req.headers.host, path: req.url })); });
  server.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  try {
    const url = new URL(`http://unresolvable.example.org:${address.port}/evidence?q=1`);
    const response = await requestPinned({ url, address: '127.0.0.1', family: 4 }, AbortSignal.timeout(2000), 1024);
    assert.deepEqual(JSON.parse(response.body.toString()), { host: url.host, path: '/evidence?q=1' });
    await assert.rejects(requestPinned({ url, address: '127.0.0.1', family: 4 }, AbortSignal.timeout(2000), 1), /size limit/);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('aborted requests stop before invoking the transport', async () => {
  let calls = 0;
  const signal = AbortSignal.abort(new Error('cancelled'));
  await assert.rejects(fetchPublic('https://example.org', { resolver, signal, transport: async (...args) => { calls++; return ok(...args); } }), /cancelled/);
  assert.equal(calls, 0);
});
