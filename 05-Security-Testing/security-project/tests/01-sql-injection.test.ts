import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const payloads = [
  { username: "admin' --", password: 'anything' }, // comment out the password check
  { username: "' OR '1'='1' --", password: 'x' }, // always-true condition
  { username: 'alice', password: "' OR '1'='1" }, // inject via password
];

describe('SQL injection on /login', () => {
  describe('🔓 vulnerable app (demonstrates the attack)', () => {
    const app = createApp('vuln');

    it.each(payloads)('bypasses login with username=$username password=$password', async (body) => {
      const res = await request(app).post('/login').send(body);
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("logs in as ADMIN with username \"admin' --\"", async () => {
      const res = await request(app).post('/login').send({ username: "admin' --", password: '' });
      expect(res.body.role).toBe('admin');
    });

    it('leaks the SQL query in error messages', async () => {
      const res = await request(app).post('/login').send({ username: "'", password: 'x' });
      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).toMatch(/SELECT \* FROM users/);
    });
  });

  describe('🔒 secure app (the security test you would really keep)', () => {
    const app = createApp('secure');

    it.each(payloads)('rejects injection payload username=$username', async (body) => {
      const res = await request(app).post('/login').send(body);
      expect(res.status).toBe(401);
      expect(res.body.token).toBeUndefined();
    });

    it('does not leak internals on malformed input', async () => {
      const res = await request(app).post('/login').send({ username: "'", password: "'" });
      expect(res.status).toBe(401);
      expect(JSON.stringify(res.body)).not.toMatch(/SELECT|SQL|sqlite/i);
    });

    it('still allows a real login', async () => {
      await request(app).post('/login').send({ username: 'alice', password: 'alice123' }).expect(200);
    });
  });
});
