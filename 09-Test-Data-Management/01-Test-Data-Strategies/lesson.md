# Lesson 1 — Test Data Strategies

## Where does test data come from?
| Source | Pros | Cons |
|--------|------|------|
| **Hardcoded in the test** | Obvious, no setup | Duplicated everywhere; one schema change breaks 200 tests |
| **Fixtures** (JSON/CSV/SQL files) | Shared, versioned, readable | Can drift from reality; shared mutable state |
| **Factories** ⭐ | Defaults + overrides, unique per call, expresses intent | Needs a little setup |
| **API/UI setup** (create via the app) | Realistic, exercises real validation | Slower; depends on those endpoints working |
| **Database seeding** | Fast bulk setup | Bypasses validation; can create impossible states |
| **Production copy (anonymized)** | Realistic volume and weirdness | Privacy risk, huge, slow, legal review |
| **Synthetic generation** (faker) | Unlimited, safe, varied | Can hide real-world edge cases |

Most teams use **factories + a little seeding**, with a few fixtures for complex reference data.

## The 4 test data principles
1. **Isolated** — a test's data belongs to that test; no test may depend on another's leftovers
2. **Deterministic** — the same data every run, or at least the same *properties*
3. **Minimal** — create only what the test needs (fast, readable)
4. **Intentional** — the data in the test shows what matters: `buildUser({ plan: 'pro' })`

## Isolation strategies (`tests/02-seeding-cleanup.test.ts`)
| Strategy | How | Parallel-safe | Speed |
|----------|-----|---------------|-------|
| **Fresh DB per test** | New in-memory DB in `beforeEach` | ✅ | ⚡ |
| **Transaction rollback** | `BEGIN` … test … `ROLLBACK` | ✅ (per connection) | ⚡ |
| **Truncate between tests** | `DELETE FROM …` in `afterEach` | ❌ | fast |
| **Track & delete own data** | Record created ids, delete them | ✅ | fast |
| **Unique data, no cleanup** | UUID/timestamp-based values | ✅ | ⚡ but the DB grows |

On shared environments (staging, a QA database), only the last two work reliably.

## ⭐ The trap our tests found
Determinism (seeded faker) and shared state pull in **opposite directions**:
seeding faker the same way in every test regenerates the **same** email, so the second insert into a shared
database violates `UNIQUE`. See the comment in `strategy 4` in `02-seeding-cleanup.test.ts`.

**Rule:** seed faker for value-level determinism, but make **identity fields** (ids, emails, usernames) unique
per run — a run-scoped prefix, UUID, or database-generated id.

## Naming test data so humans can survive it
```
test-user-{timestamp}@test.example        ← obviously test data
order-e2e-checkout-{uuid}
```
Use reserved test domains (`example.com`, `test.example`) and never real email addresses — automated tests
have sent real emails to real people more than once.

## Reference data vs transactional data
- **Reference data** (countries, product catalogue, roles): seeded once per environment, rarely changed, shared
- **Transactional data** (users, orders, sessions): created and cleaned per test

Mixing them up is why "someone deleted my user" happens.

## Environment concerns
- Test environments should hold **production-like volume** for performance testing (folder 06), but not
  production **data** (folder 04 of this section)
- Have a **reset script** that restores a known baseline in minutes
- Never point automated tests at production (and never seed test data into it)

## Check yourself
1. Why are hardcoded objects a maintenance problem?
2. Which isolation strategies work on a shared staging database?
3. Why can seeded random data cause UNIQUE violations?
4. Reference data vs transactional data — who owns cleanup for each?
