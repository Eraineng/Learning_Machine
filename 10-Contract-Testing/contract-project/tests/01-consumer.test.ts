// STEP 1 (consumer side): test the client against a MOCK provider built from our expectations,
// then publish those expectations as a contract file.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { UserClient } from '../src/consumer/userClient';
import { like, eachLike, term, resolveExample, type Contract, type Interaction } from '../src/contract';

// ── The contract: what THIS consumer needs from the provider ──────────────────
const interactions: Interaction[] = [
  {
    description: 'a request for user 1',
    providerState: 'user 1 exists',
    request: { method: 'GET', path: '/users/1' },
    response: {
      status: 200,
      body: {
        id: like(1),
        name: like('Ann Tester'),
        email: term('^[^@]+@[^@]+\\.[a-z]+$', 'ann@example.com'),
        plan: like('pro'),
        // createdAt and internalNotes are NOT listed: this consumer doesn't use them
      },
    },
  },
  {
    description: 'a request for a list of users',
    providerState: 'three users exist',
    request: { method: 'GET', path: '/users' },
    response: {
      status: 200,
      body: eachLike({ id: like(1), name: like('User 1'), email: like('user1@example.com'), plan: like('free') }, 3),
    },
  },
  {
    description: 'a request for a user that does not exist',
    providerState: 'no users exist',
    request: { method: 'GET', path: '/users/999' },
    response: { status: 404, body: { error: like('user not found') } },
  },
];

const contract: Contract = { consumer: 'web-app', provider: 'user-service', interactions };

// ── A mock provider that replies exactly as the contract says ─────────────────
let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const match = interactions.find((i) => i.request.method === req.method && i.request.path === req.url);
    if (!match) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: `No interaction defined for ${req.method} ${req.url}` }));
    }
    res.writeHead(match.response.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(resolveExample(match.response.body)));
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));

  // Publish the contract for the provider team to verify against
  // (real Pact: pact files are pushed to a Pact Broker)
  const dir = path.join(process.cwd(), 'contracts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'web-app-user-service.json'), JSON.stringify(contract, null, 2));
});

describe('UserClient against the mock provider (consumer contract tests)', () => {
  it('fetches a user', async () => {
    const client = new UserClient(baseUrl);
    await expect(client.getUser(1)).resolves.toEqual({
      id: 1,
      name: 'Ann Tester',
      email: 'ann@example.com',
      plan: 'pro',
    });
  });

  it('builds the display name the UI shows', async () => {
    const client = new UserClient(baseUrl);
    await expect(client.getDisplayName(1)).resolves.toBe('Ann Tester (pro)');
  });

  it('lists users', async () => {
    const users = await new UserClient(baseUrl).listUsers();
    expect(users).toHaveLength(3);
    expect(users[0]).toMatchObject({ id: expect.any(Number), plan: expect.any(String) });
  });

  it('turns a 404 into a clear error', async () => {
    await expect(new UserClient(baseUrl).getUser(999)).rejects.toThrow('User 999 not found');
  });
});
