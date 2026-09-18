# Topic 4 — Integration Testing: Interview Answers ⭐

**Hands-on companion:** [`../../04-Integration-Testing/`](../../04-Integration-Testing/) (23 tests: API ↔ DB ↔ external service)

## Definition
> "Integration testing verifies that **separately developed components work together correctly** — the
> interfaces and the data flowing across them. Unit tests prove each piece works alone; integration tests
> prove the pieces fit. It's where you catch mismatched field names, wrong data types, broken SQL, missing
> transactions and timeout misconfigurations."

## Why it matters (have an example ready)
Bugs unit tests with mocks **cannot** catch:
- Code sends `userId`, the database column is `user_id`
- The API returns a date string, the consumer expects a timestamp
- A SQL query is syntactically valid in the mock but wrong against the real schema
- Service A sends dollars, service B expects cents
- A boolean stored as `0/1` comes back as a number, not `true/false`
- No transaction → an order is created with no items when payment fails

> "Your mock encodes what you *believe* the other side does. Integration testing checks the belief."

## ⭐ The three approaches (asked almost every time)
| Approach | How it works | Stubs/Drivers | Pros | Cons |
|----------|--------------|---------------|------|------|
| **Big Bang** | Integrate everything, then test it all at once | — | Simple; fine for very small systems | Hard to isolate which component failed; late feedback; needs everything ready |
| **Top-Down** | Start with the top (UI/API/controller); lower modules replaced by **stubs** | **Stubs** (fake the called module) | Major design flaws found early; a demo-able skeleton exists quickly | Many stubs to write; low-level modules tested late |
| **Bottom-Up** | Start with the lowest modules (DB, utilities); callers replaced by **drivers** | **Drivers** (fake the calling module) | Solid foundation; low-level defects found early; good parallel development | The end-to-end flow is only visible late; no early demo |
| **Sandwich / Hybrid** | Top-down and bottom-up simultaneously, meeting in the middle | Both | Balanced, faster with big teams | More complex to plan and coordinate |
| **Incremental (modern CI)** | Integrate a small piece at a time, continuously | Minimal | Failures easy to locate; fast feedback | Requires automation and discipline |

**Remember the pair:**
- **Stub** = replaces a module that is **called by** the code under test (top-down)
- **Driver** = replaces a module that **calls** the code under test (bottom-up)

## ⭐ The practical API + database verification workflow
This is the answer that shows real experience — walk through it step by step:

```
1. ARRANGE   Seed known state (fast: direct DB/repository or a factory)
             Snapshot anything the operation should change:
             SELECT stock FROM products WHERE id = 10;   → 40

2. ACT       Call the real endpoint:  POST /orders {productId:10, qty:2}

3. ASSERT — response layer
             • status 201, Location header, JSON schema, response time

4. ASSERT — persistence layer  ⭐ the part juniors skip
             • the order row exists, with the right user_id and status
             • order_items rows exist and SUM(quantity*unit_price) == orders.total
             • a captured payment exists for exactly that total
             • stock decreased by exactly 2 (40 → 38)
             • no duplicate rows were created
             • no other user's data changed

5. ASSERT — downstream effects
             • the notification/email service received exactly one correct request
             • an event was published to the queue with the right payload

6. NEGATIVE  Invalid input → 400 AND **nothing written** to the database
             Downstream service down/slow → graceful failure, no partial data, seats/stock released
             Same request twice (idempotency key) → one record, not two

7. CLEANUP   Transaction rollback / delete created rows / rely on unique data
```

### Show it in code (this is in your repo)
```ts
const res = await request(app).post('/tasks').send({ title: '  Buy milk  ' }).expect(201);
expect(repo.findById(res.body.id)?.title).toBe('Buy milk');   // persisted AND trimmed

await request(app).post('/tasks').send({}).expect(400);
expect(repo.list()).toHaveLength(0);                           // nothing written on failure
```
`04-Integration-Testing/integration-project/tests/02-api-to-db.test.ts`

## What to use real vs fake
| Dependency | In integration tests | Why |
|------------|---------------------|-----|
| Your own database | ✅ **Real** (in-memory, container, or test DB) | SQL, constraints and type mapping are the point |
| Your own modules | ✅ Real | That *is* the integration |
| Third-party APIs (payments, email, SMS) | 🟡 Fake server / sandbox (WireMock, MSW, or a tiny local HTTP server) | Cost, rate limits, and you must be able to force failures |
| Time / randomness | 🟡 Controlled | Repeatability |

⭐ Prefer **Testcontainers** with the real database engine when production uses PostgreSQL/MySQL —
SQLite behaves differently (types, dates, case sensitivity).

## Test data isolation (they often drill into this)
Fresh DB per test · transaction rollback · truncate between tests · track-and-delete · unique data per test.
On shared environments only the last two work reliably. (Folder 09 covers all five.)

## Quick-fire Q&A
| Question | Answer |
|----------|--------|
| "Unit vs integration vs E2E?" | Unit = one function isolated; integration = components working together (code ↔ DB ↔ service); E2E = a full user journey through the deployed system |
| "Stub vs driver?" | Stub replaces what's called (top-down); driver replaces the caller (bottom-up) |
| "Top-down vs bottom-up?" | Top-down finds design/flow issues early but needs stubs; bottom-up builds on solid low-level modules but shows the full flow late |
| "Why not mock the database?" | Mocks can't validate SQL, constraints, transactions or type mapping — exactly where integration bugs live |
| "How do you verify a POST really worked?" | Check the response, then the database rows, then the downstream side effects, then confirm nothing else changed |
| "How do you keep integration tests stable?" | Isolated data per test, controlled fakes for third parties, explicit waits, and cleanup via transactions or unique data |
| "Where do they run?" | Every push in CI, stage 2, with service containers for the database |

## Practice
```powershell
cd ../../04-Integration-Testing/integration-project && npm install && npm test   # 23 tests
```
1. Explain each of the 3 test files out loud in 30 seconds each.
2. Add a test proving a failed notification does **not** roll back the task update — then argue whether that's correct behaviour.
3. Do exercises 3–8 in `04-Integration-Testing/05-Exercises/exercises.md`.
4. Draw the integration points of the flight-booking lab and list what you'd verify at each.
