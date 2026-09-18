import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(document.cookie)>',
  '"><svg onload=alert(1)>',
];

describe('Reflected XSS on /search', () => {
  it.each(xssPayloads)('🔓 vulnerable app reflects %s unescaped', async (payload) => {
    const res = await request(createApp('vuln')).get('/search').query({ q: payload });
    expect(res.text).toContain(payload); // browser would EXECUTE this
  });

  it.each(xssPayloads)('🔒 secure app escapes %s', async (payload) => {
    const res = await request(createApp('secure')).get('/search').query({ q: payload });
    expect(res.text).not.toContain(payload);
    expect(res.text).not.toMatch(/<script|<img|<svg/i);
    expect(res.text).toContain('&lt;'); // shown as text instead
  });

  it('🔒 secure app sends a Content-Security-Policy as a second layer of defense', async () => {
    const res = await request(createApp('secure')).get('/search?q=test');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });
});
