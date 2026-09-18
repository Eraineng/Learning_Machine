# Lesson 1 — What Is Integration Testing?

## Why unit tests aren't enough
Classic meme: two drawers that each open perfectly, installed so they block each other. ✅✅ unit tests, ❌ integration.

Real bugs that only integration tests catch:
- The code sends `userId`, but the DB column is `user_id`
- The API returns dates as `"2026-09-17"`, but the frontend expects a timestamp
- A SQL query works on a mock but has a syntax error on the real database
- Service A sends `amount` in dollars, service B expects cents
- A timeout or connection pool is misconfigured
- Transactions aren't rolled back on error, leaving half-saved data
- Booleans are stored as `0/1` but read back as numbers, not `true/false`

## Definition
**Integration testing** verifies the **interfaces and interactions** between components that are already unit tested.

| Scope | Name | Example |
|-------|------|---------|
| Modules inside one app | **Component integration** | Repository ↔ real database |
| Whole app via its API | **API / service integration** | HTTP → routes → DB |
| Separate systems | **System integration** | Our service ↔ payment provider |

## Where it sits in the pyramid
```
        /  UI / E2E  \          few
       / Integration  \         ← here: some
      /     Unit       \        many
```
Integration tests are slower than unit tests (real DB, real HTTP) but much faster and more stable than UI tests.

## Integration strategies (classic theory, often on ISTQB exams)
| Strategy | How | + | − |
|----------|-----|---|---|
| **Big Bang** | Integrate everything at once, then test | Simple | Hard to find which part broke |
| **Top-down** | Start from the top (UI/API); lower modules are **stubs** | Early view of the main flow | Needs many stubs |
| **Bottom-up** | Start from the lowest modules (DB, utils); upper callers are **drivers** | Solid foundation | Main flow is tested late |
| **Sandwich / Hybrid** | Top-down + bottom-up meeting in the middle | Balanced | More complex to plan |
| **Incremental** (modern CI) | Integrate small pieces continuously | Failures are easy to locate | Needs automation |

- **Stub** = a fake of something **called by** the module under test
- **Driver** = a fake of something that **calls** the module under test

## What to use real vs fake
| Dependency | In integration tests | Why |
|------------|---------------------|-----|
| **Your database** | ✅ Real (in-memory, container, or test DB) | SQL, constraints and mapping are exactly what you're testing |
| **Your own modules** | ✅ Real | That's the integration |
| **File system** | ✅ Real (temp folder) | Cheap |
| **External 3rd-party APIs** (payments, email, SMS) | 🟡 Fake server / sandbox | Cost, rate limits, can't control failures |
| **Time** | 🟡 Controlled when needed | Repeatability |

## Characteristics of good integration tests
- **Isolated data:** each test creates its own data and doesn't depend on leftovers
- **Clean environment:** fresh DB or cleanup after each test
- **Deterministic:** no dependence on the internet or shared staging data
- **Focused:** test the *integration point*. Don't re-test every validation rule already covered by unit tests
- **Verify side effects:** check the DB, messages or calls, not just the HTTP response

## Check yourself
1. Give 2 bugs that unit tests with mocks would miss.
2. What's the difference between a stub and a driver?
3. Should your integration test use a real database? A real payment provider? Why?
