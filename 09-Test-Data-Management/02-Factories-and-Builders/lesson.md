# Lesson 2 — Factories, Traits and Builders

📂 Code: `data-project/src/factories.ts`, `tests/01-factories.test.ts`

## The problem factories solve
```ts
// ❌ Which field does this test actually care about?
const user = { id: 1, email: 'a@b.com', firstName: 'Ann', lastName: 'T', phone: '+1',
               plan: 'pro', active: true, createdAt: '2026-01-01' };

// ✅ Intent is obvious; everything else is a valid default
const user = buildUser({ plan: 'pro' });
```
Add a required field to `User` later and you fix **one** factory, not 200 tests.

## Factory anatomy
```ts
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: nextId(),                                    // unique
    email: faker.internet.email({ provider: 'test.example' }),
    firstName: faker.person.firstName(),
    plan: 'free',                                    // sensible default
    active: true,
    createdAt: new Date('2026-01-01').toISOString(), // fixed date → stable assertions
    ...overrides,                                     // ⭐ the test's intent wins
  };
}
```
Rules: valid by default, unique where uniqueness matters, overrides last, and **derived values computed**
(`buildOrder` recalculates `total` so a test can't accidentally assert a wrong total).

## Traits: name your variations
```ts
traits.proUser()            // instead of buildUser({ plan: 'pro' }) everywhere
traits.inactiveUser()
traits.userWithUnicodeName()   // 日本語 / Ñandú / 😀 — an edge case you should test often
traits.userWithLongName()      // boundary testing from folder 00
```
Traits turn test-design knowledge into reusable, self-documenting building blocks.

## Builders for complex objects
```ts
const order = new OrderBuilder()
  .forUser(42)
  .withItem('Blue Mug', 12.5, 2)
  .withStatus('paid')
  .build();
```
Use a builder when an object has many optional parts or relationships; use a plain factory otherwise.

## faker: synthetic data
```ts
faker.person.firstName();  faker.internet.email();  faker.commerce.productName();
faker.string.uuid();       faker.number.int({ min: 1, max: 100 });  faker.date.past();
faker.location.streetAddress();  faker.phone.number();
faker.seed(12345);          // ⭐ same "random" data every run
```
Why generated data is valuable: it constantly varies names, lengths and characters, so tests bump into
apostrophes (`O'Brien`), long names and unicode — real bugs you'd never write by hand.
Why to be careful: a test that fails only for *one* random value is a flaky test. When you find such a value,
**pin it as a regression test case**.

## Fixtures still have a place
Use a fixture file when data is complex, shared and stable: a product catalogue, a big API response for a
mock, a PDF/image for upload tests. Keep them small, version them, and never put real personal data in them.

## Object Mother vs Factory
- **Object Mother**: named methods returning ready-made objects (`Users.proUser()`), fewer knobs
- **Factory + overrides** (what we use): more flexible, less duplication
Both are fine; be consistent within a project.

## Try it
1. Add a `traits.expiredTrialUser()` and use it in a test.
2. Add a `UserBuilder` with `.withPlan()`, `.inactive()`, `.createdDaysAgo(n)`.
3. Change `User` to require a `country` field. How many places do you have to edit? (That's the payoff.)
4. Remove `faker.seed()` and run the suite 10 times. Does anything become flaky? Why is that valuable information?
