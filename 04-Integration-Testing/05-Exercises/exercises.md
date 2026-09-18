# Integration Testing — Exercises

Work in `integration-project/`. Add tests to `tests/exercises/`.

## Level 1 — Explore
1. Draw the architecture of the Task API from memory. Mark every **integration point**.
2. For each integration point, list 3 things that could go wrong that unit tests wouldn't catch.

## Level 2 — Database
3. Add pagination to the repository: `list({ limit, offset })`. Test with 25 seeded tasks: page 1, page 3 (partial), and beyond the end.
4. Add a `users` table and a foreign key `tasks.assignee_id → users.id` (remember `PRAGMA foreign_keys = ON`). Test that deleting a user with tasks fails (or cascades — decide which, then test it).
5. Implement the transaction-rollback isolation strategy and compare test speed with the current approach.

## Level 3 — API
6. Add `GET /tasks?search=milk` (case-insensitive title search). Test with seeded data including `Milk`, `MILK`, `almond milk` and `silk`.
7. Add simple auth: `POST /tasks` requires the header `X-Api-Key: secret`. Test 401 without a key, 403 with a wrong key, and 201 with the right one.
8. Find and fix at least **2 validation bugs** in `PATCH /tasks/:id` (hints: empty title, `done: "yes"`).

## Level 4 — External services
9. Add retries with exponential backoff to `Notifier` and test them using the fake server.
10. Add a **circuit breaker**: after 3 consecutive failures, stop calling the service for 30s. Test it with fake timers or an injectable clock.
11. Replace the fake server with **MSW** in one test file.

## Level 5 — Full stack
12. Run `npm start`, then write **Playwright API tests** (reuse `01-API-Testing/03-Playwright-API-Tests`) against `http://localhost:3000`. Which tests belong here, and which belong in supertest tests? Write down your reasoning.
13. (Needs Docker) Replace SQLite with PostgreSQL using **Testcontainers**. What differences did you hit?

## Quiz
1. Top-down integration uses stubs or drivers?
2. Why verify the database after a `POST`, instead of trusting the `201` response?
3. Name 3 test data isolation strategies.
4. Why is a fake external server better than mocking the `Notifier` class, for integration tests?
5. How can fakes give false confidence, and what reduces that risk?

<details><summary>Answers</summary>

1. Stubs (lower modules are faked); bottom-up uses drivers.
2. The response could be built from the request without saving, or the save could be partial or wrong. The side effect is what matters.
3. Fresh DB per test, transaction rollback, truncating tables, unique data per test, Testcontainers.
4. The real HTTP client code runs: URL, serialization, headers, timeouts and error handling are all tested.
5. The fake may not match the real service's behavior. Reduce the risk with contract tests, sandbox smoke tests, and recorded real responses.

</details>
