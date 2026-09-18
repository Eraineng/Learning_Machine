import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { loginAs } from './helpers';

describe('Brute force protection', () => {
  it('🔓 vulnerable: unlimited password guesses', async () => {
    const app = createApp('vuln');
    for (let i = 0; i < 20; i++) {
      await request(app).post('/login').send({ username: 'alice', password: `guess${i}` }).expect(401);
    }
    await request(app).post('/login').send({ username: 'alice', password: 'alice123' }).expect(200);
  });

  it('🔒 secure: locked after 5 failed attempts', async () => {
    const app = createApp('secure');
    for (let i = 0; i < 5; i++) {
      await request(app).post('/login').send({ username: 'alice', password: `guess${i}` }).expect(401);
    }
    await request(app).post('/login').send({ username: 'alice', password: 'alice123' }).expect(429);
  });

  it('🔒 secure: same error for unknown user and wrong password (no user enumeration)', async () => {
    const app = createApp('secure');
    const unknown = await request(app).post('/login').send({ username: 'nobody', password: 'x' });
    const wrongPw = await request(app).post('/login').send({ username: 'bob', password: 'x' });
    expect(unknown.status).toBe(wrongPw.status);
    expect(unknown.body).toEqual(wrongPw.body);
  });

  it('🔒 secure: rejects weak passwords on register', async () => {
    await request(createApp('secure')).post('/register').send({ username: 'weak', password: '123' }).expect(400);
  });
});

describe('Sensitive data exposure', () => {
  it('🔓 vulnerable: profile returns the password', async () => {
    const app = createApp('vuln');
    const token = await loginAs(app, 'alice', 'alice123');
    const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(res.body.password).toBe('alice123');
  });

  it('🔒 secure: profile contains no secrets', async () => {
    const app = createApp('secure');
    const token = await loginAs(app, 'alice', 'alice123');
    const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`).expect(200);

    expect(Object.keys(res.body).sort()).toEqual(['id', 'role', 'username']);
    expect(JSON.stringify(res.body)).not.toMatch(/alice123|password|hash/i);
  });
});

describe('Security headers', () => {
  it('🔓 vulnerable: advertises the framework and lacks protective headers', async () => {
    const res = await request(createApp('vuln')).get('/search?q=x');
    expect(res.headers['x-powered-by']).toBe('Express');
    expect(res.headers['content-security-policy']).toBeUndefined();
  });

  it('🔒 secure: sends recommended headers', async () => {
    const res = await request(createApp('secure')).get('/search?q=x');

    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers).toMatchObject({
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer',
    });
    expect(res.headers['strict-transport-security']).toContain('max-age=');
  });
});

describe('Open redirect', () => {
  it.each(['https://evil.example', '//evil.example'])('🔓 vulnerable: redirects to %s', async (url) => {
    const res = await request(createApp('vuln')).get('/redirect').query({ url });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(url);
  });

  it.each(['https://evil.example', '//evil.example'])('🔒 secure: blocks %s', async (url) => {
    await request(createApp('secure')).get('/redirect').query({ url }).expect(400);
  });

  it('🔒 secure: allows local paths', async () => {
    const res = await request(createApp('secure')).get('/redirect').query({ url: '/orders/2' }).expect(302);
    expect(res.headers.location).toBe('/orders/2');
  });
});
