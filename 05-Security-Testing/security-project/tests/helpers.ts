import request from 'supertest';
import type { Express } from 'express';

export async function loginAs(app: Express, username: string, password: string): Promise<string> {
  const res = await request(app).post('/login').send({ username, password }).expect(200);
  return res.body.token;
}
