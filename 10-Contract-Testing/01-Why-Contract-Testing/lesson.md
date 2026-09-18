# Lesson 1 — Why Contract Testing Exists

## The problem
```
web-app ──► user-service ──► billing-service ──► payment-provider
   │                └──────► email-service
   └──────► order-service ──► inventory-service
```
With 20 services, how do you know a change to `user-service` won't break its 6 consumers?

### Option A: End-to-end tests with everything deployed
- 🐌 Slow (minutes to hours), 💥 flaky, 💰 expensive environments
- Needs **every** service deployed and in the right state at once
- When it fails, it's often unclear which team broke what

### Option B: Integration tests with mocks (folder 04)
- ⚡ Fast and stable
- ❌ **Your mock can be wrong.** It encodes what you *believe* the provider does. The provider changes,
  your mock doesn't, tests stay green, production breaks.

### Option C: Contract testing ⭐
The consumer's mock **becomes a shared, verified contract**. The provider's pipeline replays it against the
real provider. If the provider drifts, **their** build fails — with no consumer deployed and no shared environment.

## Consumer-driven contracts
The **consumer** defines what it needs:
> "When I GET /users/1, I need a 200 with `id` (number), `name` (string), `email` (email-shaped string), `plan` (string)."

The **provider** must satisfy every consumer's contract. Key consequences:
- ✅ The provider learns exactly **which fields are actually used** by whom
- ✅ Adding a field is safe. Removing `createdAt` is safe **if nobody's contract requires it**
- ✅ Each team tests alone, in seconds

## Breaking vs non-breaking changes
| Change | Breaking? |
|--------|-----------|
| Add a new field to a response | ✅ Safe |
| Add a new optional request parameter | ✅ Safe |
| Rename a field (`plan` → `subscriptionTier`) | 💥 Breaking |
| Remove a field a consumer uses | 💥 Breaking |
| Change a type (`"12"` → `12`) | 💥 Breaking |
| Change a status code (200 → 204) | 💥 Breaking |
| Make an optional request field required | 💥 Breaking |

Our `03-breaking-change.test.ts` shows the scariest part: with v2, nothing throws. The client just produces
`"undefined (undefined)"` in the UI. **Silent breakage** is what contract testing prevents.

## Where contract testing fits
```
   E2E (a few smoke journeys)
   Contract tests  ← replace most cross-service integration tests
   Integration tests (your service + its own DB)
   Unit tests
```
It does **not** replace:
- Functional testing of the provider's own logic (it only checks the shape of the agreed interactions)
- Testing your own service's internals
- A few real end-to-end smoke tests

## When to use it
✅ Multiple services/teams, independent deployments, microservices, public-ish APIs with known consumers,
mobile apps + backend (you can't force users to upgrade!)

❌ A single monolith, a provider you don't control (use a schema/smoke tests instead), one team owning both
sides with a shared repo (types + integration tests may be enough), or too few services to justify the setup

## Check yourself
1. Why can a passing integration test with mocks still let production break?
2. What does "consumer-driven" mean?
3. Is adding a field breaking? Renaming one?
4. Which tests can contract testing replace, and which can't it?
