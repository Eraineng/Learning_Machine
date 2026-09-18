// STEP 2 (provider side): replay every interaction in the contract against the REAL provider.
// This runs in the provider team's pipeline. If it fails, they must not deploy.
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createProvider } from '../src/provider/userService';
import { verify, type Contract } from '../src/contract';

const contractFile = path.join(process.cwd(), 'contracts', 'web-app-user-service.json');

function loadContract(): Contract {
  if (!existsSync(contractFile)) {
    throw new Error('Contract file missing — run the consumer tests first (npm run test:consumer)');
  }
  return JSON.parse(readFileSync(contractFile, 'utf8'));
}

describe('Provider verification: user-service satisfies web-app\'s contract', () => {
  let contract: Contract;
  beforeAll(() => {
    contract = loadContract();
  });

  it('verifies every interaction', async () => {
    const app = createProvider({ version: 'v1' });
    const failures: string[] = [];

    for (const interaction of contract.interactions) {
      // 1. Put the provider into the required state
      await request(app).post('/_test/state').send({ state: interaction.providerState }).expect(204);

      // 2. Replay the consumer's request
      const res = await request(app)[interaction.request.method.toLowerCase() as 'get'](interaction.request.path);

      // 3. Compare status and body against the contract
      if (res.status !== interaction.response.status) {
        failures.push(`${interaction.description}: expected status ${interaction.response.status}, got ${res.status}`);
        continue;
      }
      const mismatches = verify(interaction.response.body, res.body);
      failures.push(...mismatches.map((m) => `${interaction.description}: ${m}`));
    }

    expect(failures).toEqual([]);
  });

  it('extra provider fields do NOT break the contract', async () => {
    const app = createProvider({ version: 'v1' });
    await request(app).post('/_test/state').send({ state: 'user 1 exists' }).expect(204);

    const res = await request(app).get('/users/1').expect(200);

    // The provider returns createdAt + internalNotes, which the consumer never asked for
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('internalNotes');

    const interaction = contract.interactions.find((i) => i.request.path === '/users/1')!;
    expect(verify(interaction.response.body, res.body)).toEqual([]); // still satisfied ✅
  });
});
