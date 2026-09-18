# Lesson 2 — The Contract Testing Flow, Hands-On

📂 Code: `contract-project/`

## The 3 steps
```
CONSUMER SIDE (web-app repo)                    PROVIDER SIDE (user-service repo)
────────────────────────────                    ────────────────────────────────
1. Write consumer tests against
   a MOCK built from expectations
        │  tests pass
        ▼
2. Contract file is generated  ──published──►   3. Replay every interaction against
   (contracts/*.json)                              the REAL provider → pass/fail
```

## Step 1 — Consumer test (`01-consumer.test.ts`)
Define the interactions, start a mock provider that answers exactly that way, and test the **real client code**:
```ts
{
  description: 'a request for user 1',
  providerState: 'user 1 exists',
  request:  { method: 'GET', path: '/users/1' },
  response: { status: 200, body: { id: like(1), name: like('Ann Tester'),
                                   email: term('^[^@]+@[^@]+\\.[a-z]+$', 'ann@example.com'), plan: like('pro') } },
}
```
Then:
```ts
await expect(client.getDisplayName(1)).resolves.toBe('Ann Tester (pro)');
```
This test does double duty: it verifies **your client code** and records **your expectations**.

⚠️ Only include fields you actually use. Every field you list becomes an obligation for the provider.

## Matchers: type, not value
| Matcher | Meaning | Why |
|---------|---------|-----|
| `like(1)` | any **number** | The provider's real id will differ from the example |
| `like('Ann')` | any **string** | |
| `term('^\\d{4}-\\d{2}-\\d{2}$', '2026-01-05')` | matches the **regex** | Format matters (dates, ids, emails) |
| `eachLike({...}, 3)` | an **array** of objects shaped like this, min 3 | Real list length varies |

Matching on exact values would make every contract fail against real provider data. This is the single most
important idea in contract testing.

## Provider states
```ts
{ providerState: 'user 1 exists' }
```
The contract can't say "given the database has whatever it has". Before replaying each interaction, the
provider puts itself into the named state (seeds that data). In our provider that's a test-only
`POST /_test/state`; in Pact it's a **state handler** function.

State names are part of the contract: both teams must agree on them.

## Step 2 — Provider verification (`02-provider-verification.test.ts`)
For every interaction: set the state → send the request → compare status and body with the matchers.
```
❌ body.name: MISSING from the provider response
❌ body.plan: MISSING from the provider response
```
That's the failure message from `03-breaking-change.test.ts` — precise, actionable, and produced in the
provider's own pipeline before any deployment.

## The extra-fields rule
`02-provider-verification.test.ts` proves it: the provider returns `createdAt` and `internalNotes`,
which appear in **no** contract, and verification still passes.
> Contracts are a **minimum guarantee**, not a full schema. Providers can grow; they just can't shrink or rename.

## Reading the mini-verifier (`src/contract.ts`)
`verify(expected, actual)` walks the expected shape:
- Matcher → check type / regex / array shape
- Object → every expected key must exist (extra actual keys allowed) and recurse
- Primitive → must be exactly equal

~60 lines is all a basic Pact verifier needs. Reading it makes the real tool much less magical.

## Try it
1. Run `npm run test:consumer` and open `contracts/web-app-user-service.json`.
2. Add `createdAt: like('2026-01-05T10:00:00.000Z')` to the contract and re-run both sides. Still green?
   Now change it to `term('^\\d{4}-\\d{2}-\\d{2}$', '2026-01-05')`. What happens, and why?
3. Add a new interaction: `GET /users/1/orders`. Watch provider verification fail (the route doesn't exist), then implement it.
4. In `userClient.ts`, start using `user.createdAt` without adding it to the contract. Who would catch the eventual breakage? (Nobody — that's the lesson: contracts must reflect real usage.)
