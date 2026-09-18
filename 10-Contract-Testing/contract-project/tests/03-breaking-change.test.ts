// STEP 3: the provider team refactors the API. Contract testing catches it BEFORE deployment —
// no integration environment, no consumer running, just a fast test in their own pipeline.
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createProvider } from '../src/provider/userService';
import { verify, type Contract } from '../src/contract';
import { UserClient } from '../src/consumer/userClient';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

const contract: Contract = JSON.parse(
  readFileSync(path.join(process.cwd(), 'contracts', 'web-app-user-service.json'), 'utf8'),
);

describe('provider v2 renames fields (a breaking change)', () => {
  it('verification FAILS and names the exact broken fields', async () => {
    const app = createProvider({ version: 'v2-breaking' });
    await request(app).post('/_test/state').send({ state: 'user 1 exists' }).expect(204);

    const res = await request(app).get('/users/1').expect(200);
    const interaction = contract.interactions.find((i) => i.request.path === '/users/1')!;
    const mismatches = verify(interaction.response.body, res.body);

    console.log('Contract violations detected:\n  ' + mismatches.join('\n  '));

    expect(mismatches).toEqual([
      'body.name: MISSING from the provider response',
      'body.plan: MISSING from the provider response',
    ]);
  });

  it('shows the real-world consequence: the consumer silently breaks', async () => {
    // Serve provider v2 over HTTP and point the real client at it
    const providerApp = createProvider({ version: 'v2-breaking' });
    const server = http.createServer(providerApp);
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    await request(providerApp).post('/_test/state').send({ state: 'user 1 exists' });

    const displayName = await new UserClient(baseUrl).getDisplayName(1);

    // No error, no 500 — just a broken UI saying "undefined (undefined)" 🐞
    expect(displayName).toBe('undefined (undefined)');

    await new Promise<void>((r) => server.close(() => r()));
  });

  it('a NON-breaking change (adding a field) passes verification', async () => {
    const app = createProvider({ version: 'v1' });
    await request(app).post('/_test/state').send({ state: 'three users exist' }).expect(204);

    const res = await request(app).get('/users').expect(200);
    const interaction = contract.interactions.find((i) => i.request.path === '/users')!;

    expect(verify(interaction.response.body, res.body)).toEqual([]);
  });
});
