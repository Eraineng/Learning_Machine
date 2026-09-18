# Lesson 3 — Pact and the Real World

Our `src/contract.ts` is a teaching model. In real projects you'd use **Pact** — the de-facto standard,
with implementations for JS, Java, .NET, Go, Python, Ruby, PHP, Swift and Kotlin (they all share the same
contract format, so a JS consumer can verify against a Java provider).

## Pact JS — consumer side
```ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
const { like, regex, eachLike } = MatchersV3;

const provider = new PactV3({ consumer: 'web-app', provider: 'user-service', dir: './pacts' });

describe('UserClient', () => {
  it('gets a user', async () => {
    provider
      .given('user 1 exists')                       // provider state
      .uponReceiving('a request for user 1')
      .withRequest({ method: 'GET', path: '/users/1', headers: { Accept: 'application/json' } })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { id: like(1), name: like('Ann Tester'), plan: like('pro'),
                email: regex('^[^@]+@[^@]+$', 'ann@example.com') },
      });

    await provider.executeTest(async (mockServer) => {
      const user = await new UserClient(mockServer.url).getUser(1);   // ← real client code
      expect(user.name).toBe('Ann Tester');
    });
  });
});
// Running this writes ./pacts/web-app-user-service.json
```

## Pact JS — provider side
```ts
import { Verifier } from '@pact-foundation/pact';

await new Verifier({
  provider: 'user-service',
  providerBaseUrl: 'http://localhost:3000',          // your real service, running
  pactBrokerUrl: process.env.PACT_BROKER_URL,        // or pactUrls: ['./pacts/…json']
  publishVerificationResult: true,
  providerVersion: process.env.GIT_COMMIT,
  stateHandlers: {                                    // ⭐ set up data per provider state
    'user 1 exists': async () => { await db.users.insert({ id: 1, name: 'Ann Tester', plan: 'pro' }); },
    'no users exist': async () => { await db.users.deleteAll(); },
  },
  requestFilters: [(req, res, next) => { req.headers['Authorization'] = 'Bearer test'; next(); }],
}).verifyProvider();
```

## Pact Broker: where contracts live
A server that stores contracts and verification results.
- Consumers **publish** pacts on every build; providers **fetch and verify** them
- Shows a matrix: which consumer version works with which provider version
- **`can-i-deploy`** — the killer feature:
```powershell
pact-broker can-i-deploy --pacticipant user-service --version $GIT_SHA --to-environment production
```
> "Can I deploy this version safely?" → checks every consumer contract has been verified against it.
Hosted option: **PactFlow**. Self-hosted: the open-source Pact Broker (Docker).

## Versioning and `WIP`/pending pacts
- Tag pacts with the consumer's branch/version so a new consumer requirement doesn't instantly break the provider's build
- **Pending pacts**: new, unverified contracts are reported but don't fail the provider build — the consumer team gets feedback without blocking the provider

## CI wiring
```
Consumer pipeline                     Provider pipeline
─────────────────                     ─────────────────
run consumer tests                    fetch pacts from broker
publish pact (version = git sha)  ──► verify against real provider
can-i-deploy? ──► deploy              publish results
                                      can-i-deploy? ──► deploy
```
Provider verification should also run on a **webhook** when a consumer publishes a new pact.

## Other contract approaches
| Approach | How | Notes |
|----------|-----|-------|
| **Pact** (consumer-driven) | Consumer expectations verified against provider | Best for known internal consumers |
| **Provider-driven / spec-first** | OpenAPI/AsyncAPI spec is the contract; both sides validate against it | Good for public APIs and unknown consumers |
| **Schema validation** | Validate responses against JSON Schema in tests (`ajv`), or in production monitoring | Cheap, catches type/shape drift |
| **Spring Cloud Contract** | Groovy/YAML contracts, generates tests + stubs | Java ecosystem |
| **GraphQL / gRPC schema checks** | `graphql-inspector`, protobuf compatibility checks, Apollo schema checks | Built into those ecosystems |

Many teams combine: OpenAPI spec for documentation + Pact for the consumers that matter most.

## Common pitfalls
- ❌ Putting **exact values** in contracts instead of matchers → false failures
- ❌ Contracts that mirror the whole API instead of what the consumer uses → provider paralysis
- ❌ Provider states that aren't isolated → flaky verification
- ❌ Publishing pacts from a local machine instead of CI
- ❌ Treating contract tests as a replacement for functional testing of the provider
- ❌ No Broker: pact files emailed around or copied between repos

## Try it
1. Install Pact JS (`npm i -D @pact-foundation/pact`) and rewrite `01-consumer.test.ts` with `PactV3`. Compare the generated pact file with ours.
2. Run a Pact Broker locally with Docker (`pactfoundation/pact-broker`) and publish your pact to it.
3. Write the CI steps (folder 14 style) for both pipelines, including `can-i-deploy`.
4. Take the OpenAPI spec of any public API and validate a real response against it with `ajv`. How is that different from consumer-driven testing?
