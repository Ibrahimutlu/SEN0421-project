import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import http from 'node:http';
import https from 'node:https';
import ipaddr from 'ipaddr.js';

export class ScanError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export type Resolver = (host: string) => Promise<{ address: string; family: number }[]>;
export const resolveHost: Resolver = host => lookup(host, { all: true, verbatim: true });

export function isPublicAddress(address: string): boolean {
  try {
    const parsed = ipaddr.process(address);
    if (parsed.range() !== 'unicast') return false;
    if (parsed.kind() === 'ipv6') return parsed.match(ipaddr.parse('2000::'), 3);
    return true;
  } catch { return false; }
}

export function parseTarget(input: string): URL {
  if (input.length > 2048) throw new ScanError('The URL exceeds 2048 characters.');
  let url: URL;
  try { url = new URL(input); } catch { throw new ScanError('Enter a valid HTTP or HTTPS URL.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new ScanError('Only HTTP and HTTPS are supported.');
  if (url.username || url.password) throw new ScanError('URLs containing credentials are not allowed.');
  if (url.port && !['80', '443'].includes(url.port)) throw new ScanError('Only ports 80 and 443 are allowed.');
  const host = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  if (!host.includes('.') && !isIP(host)) throw new ScanError('A public hostname is required.');
  if (host === 'localhost' || /\.(localhost|local|internal|home|test|invalid)$/.test(host)) {
    throw new ScanError('Local and reserved hostnames are not allowed.');
  }
  url.hash = '';
  return url;
}

export async function validateTarget(input: string, resolver: Resolver = resolveHost) {
  const url = parseTarget(input);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await resolver(host);
  if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) {
    throw new ScanError('The target resolves to a private, local or reserved address.');
  }
  return { url, address: addresses[0].address, family: addresses[0].family };
}

export type PinnedTarget = Awaited<ReturnType<typeof validateTarget>>;
export type FetchResponse = { status: number; headers: Record<string, string>; body: Buffer };
export type Transport = (target: PinnedTarget, signal: AbortSignal, maxBytes: number, onBytes?: (count: number) => void) => Promise<FetchResponse>;

export const requestPinned: Transport = (target, signal, maxBytes, onBytes) => new Promise((resolve, reject) => {
  const secure = target.url.protocol === 'https:';
  const request = (secure ? https : http).request({
    hostname: target.address, family: target.family, port: target.url.port || (secure ? 443 : 80),
    path: target.url.pathname + target.url.search, method: 'GET', agent: false,
    servername: isIP(target.url.hostname) ? undefined : target.url.hostname,
    headers: { Host: target.url.host, 'User-Agent': 'SDS-09/0.2 accessibility-audit', 'Accept-Encoding': 'identity' },
    signal, timeout: 6000, maxHeaderSize: 16384
  }, response => {
    const chunks: Buffer[] = [];
    let size = 0;
    response.on('data', (chunk: Buffer) => {
      size += chunk.length;
      try { onBytes?.(chunk.length); }
      catch (error) {
        reject(error); response.destroy(error as Error); request.destroy(error as Error); return;
      }
      if (size > maxBytes) {
        const error = new ScanError('The response exceeds the scan size limit.', 422);
        reject(error); response.destroy(error); request.destroy(error); return;
      }
      chunks.push(chunk);
    });
    response.on('error', reject);
    response.on('end', () => {
      if (size > maxBytes) return;
      const headers: Record<string, string> = {};
      for (const [name, value] of Object.entries(response.headers)) {
        if (value !== undefined) headers[name] = Array.isArray(value) ? value.join(', ') : value;
      }
      resolve({ status: response.statusCode ?? 502, headers, body: Buffer.concat(chunks) });
    });
  });
  request.on('timeout', () => request.destroy(new ScanError('The resource request timed out.', 504)));
  request.on('error', reject);
  request.end();
});

export type NetworkBudget = { requests: number; bytes: number; maxRequests: number; maxBytes: number };
export const defaultBudget = (): NetworkBudget => ({ requests: 0, bytes: 0, maxRequests: 40, maxBytes: 10 * 1024 * 1024 });

async function withSignal<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let onAbort: () => void = () => {};
  try {
    return await Promise.race([work, new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(signal.reason);
      signal.addEventListener('abort', onAbort, { once: true });
    })]);
  } finally { signal.removeEventListener('abort', onAbort); }
}

export async function fetchPublic(input: string, options: {
  signal?: AbortSignal; resolver?: Resolver; transport?: Transport; budget?: NetworkBudget;
} = {}): Promise<FetchResponse & { finalUrl: string }> {
  const signal = options.signal ?? AbortSignal.timeout(10_000);
  const budget = options.budget ?? defaultBudget();
  let current = input;
  for (let redirect = 0; redirect <= 4; redirect++) {
    signal.throwIfAborted();
    if (++budget.requests > budget.maxRequests || budget.bytes >= budget.maxBytes) {
      throw new ScanError('The scan network budget was exceeded.', 422);
    }
    const target = await withSignal(validateTarget(current, options.resolver), signal);
    signal.throwIfAborted();
    let streamedBytes = 0;
    const charge = (count: number) => {
      streamedBytes += count; budget.bytes += count;
      if (budget.bytes > budget.maxBytes) throw new ScanError('The scan size limit was exceeded.', 422);
    };
    const response = await (options.transport ?? requestPinned)(target, signal, Math.min(2 * 1024 * 1024, budget.maxBytes - budget.bytes), charge);
    if (response.body.length > streamedBytes) charge(response.body.length - streamedBytes);
    if (budget.bytes > budget.maxBytes || response.body.length > 2 * 1024 * 1024) {
      throw new ScanError('The scan size limit was exceeded.', 422);
    }
    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
      current = new URL(response.headers.location, target.url).href;
      continue;
    }
    return { ...response, finalUrl: target.url.href };
  }
  throw new ScanError('More than four redirects are not supported.', 422);
}
