import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { loginAs } from './helpers';

// Order 1 belongs to alice, order 2 belongs to bob

describe('Broken access control', () => {
  describe('IDOR: Insecure Direct Object Reference', () => {
    it('🔓 vulnerable: bob can read alice\'s order by changing the id', async () => {
      const app = createApp('vuln');
      const bobToken = await loginAs(app, 'bob', 'bob123');

      const res = await request(app).get('/orders/1').set('Authorization', `Bearer ${bobToken}`);

      expect(res.status).toBe(200);
      expect(res.body.item).toBe('Alice laptop'); // 🚨 data breach
    });

    it('🔒 secure: bob gets 404 for alice\'s order', async () => {
      const app = createApp('secure');
      const bobToken = await loginAs(app, 'bob', 'bob123');

      await request(app).get('/orders/1').set('Authorization', `Bearer ${bobToken}`).expect(404);
      await request(app).get('/orders/2').set('Authorization', `Bearer ${bobToken}`).expect(200); // own order OK
    });

    it('🔒 secure: enumerating ids reveals nothing', async () => {
      const app = createApp('secure');
      const bobToken = await loginAs(app, 'bob', 'bob123');

      const statuses = await Promise.all(
        [1, 3, 4, 999].map(async (id) => (await request(app).get(`/orders/${id}`).set('Authorization', `Bearer ${bobToken}`)).status),
      );
      expect(new Set(statuses)).toEqual(new Set([404])); // existing and missing look identical
    });
  });

  describe('Missing function-level authorization', () => {
    it('🔓 vulnerable: normal user can call the admin endpoint', async () => {
      const app = createApp('vuln');
      const token = await loginAs(app, 'alice', 'alice123');
      await request(app).get('/admin/users').set('Authorization', `Bearer ${token}`).expect(200);
    });

    it('🔒 secure: normal user gets 403, admin gets 200', async () => {
      const app = createApp('secure');
      const alice = await loginAs(app, 'alice', 'alice123');
      const admin = await loginAs(app, 'admin', 'Adm1n!Secret');

      await request(app).get('/admin/users').set('Authorization', `Bearer ${alice}`).expect(403);
      await request(app).get('/admin/users').set('Authorization', `Bearer ${admin}`).expect(200);
    });
  });

  describe('Authentication required', () => {
    it.each(['/orders/1', '/admin/users', '/profile'])('🔒 %s without token → 401', async (path) => {
      await request(createApp('secure')).get(path).expect(401);
    });

    it('🔒 fake token → 401', async () => {
      await request(createApp('secure')).get('/profile').set('Authorization', 'Bearer not-a-real-token').expect(401);
    });
  });

  describe('Mass assignment', () => {
    it('🔓 vulnerable: user registers themselves as admin', async () => {
      const res = await request(createApp('vuln'))
        .post('/register')
        .send({ username: 'mallory', password: 'password1', role: 'admin' });
      expect(res.body.role).toBe('admin');
    });

    it('🔒 secure: role in body is ignored', async () => {
      const res = await request(createApp('secure'))
        .post('/register')
        .send({ username: 'mallory', password: 'password1', role: 'admin' })
        .expect(201);
      expect(res.body.role).toBe('user');
    });
  });
});
