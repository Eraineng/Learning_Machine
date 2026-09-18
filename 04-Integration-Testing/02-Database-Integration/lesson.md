# Lesson 2 — Database Integration Tests

📂 Code: `integration-project/tests/01-repository-db.test.ts`

## What we verify
- SQL queries are **valid** and return the right rows
- **Mapping** between DB rows and code objects (`done: 0` → `false`, `created_at` → `createdAt`)
- **Constraints**: NOT NULL, UNIQUE, foreign keys
- **Special data**: quotes, emoji, unicode, very long strings, NULLs
- **Security**: parameterized queries resist SQL injection
- Transactions, ordering, filtering, pagination

## The #1 challenge: test data isolation
Tests that share a database affect each other: "passes alone, fails in the suite".

| Strategy | How | Speed | Realism |
|----------|-----|-------|---------|
| **Fresh in-memory DB per test** | `createDb(':memory:')` in `beforeEach` | ⚡ fastest | Good if prod uses the same engine |
| **Transaction rollback** | `BEGIN` before each test, `ROLLBACK` after | ⚡ fast | High |
| **Truncate tables** | `DELETE FROM ...` in `beforeEach` | Medium | High |
| **Unique data per test** | e.g. email `user-${randomUUID()}@test.com`, never clean up | Fast | High, parallel-safe |
| **Testcontainers** | Spin up real PostgreSQL/MySQL in Docker per test run | Slower start | ✅ Identical to prod |

Our project uses a **fresh in-memory SQLite per test**.
⚠️ In real projects, if production uses PostgreSQL, test against **PostgreSQL** (via Testcontainers or a dedicated test DB). SQLite and PostgreSQL behave differently: types, date functions, case sensitivity.

### Testcontainers example (Node, needs Docker)
```ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container;
beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  db = connect(container.getConnectionUri());
  await runMigrations(db);
}, 60_000);
afterAll(() => container.stop());
```

## Arrange via DB, assert via code (or the reverse)
```ts
// Seed directly → test the code's read logic
db.prepare('INSERT INTO tasks (title, done) VALUES (?, 1)').run('Seeded');
expect(repo.list({ done: true })).toHaveLength(1);

// Act via code → verify directly in the DB
repo.create('Via code');
const row = db.prepare('SELECT * FROM tasks WHERE title = ?').get('Via code');
expect(row.done).toBe(0);
```

## SQL injection check
```ts
const nasty = `Robert'); DROP TABLE tasks;--`;
repo.create(nasty);
expect(repo.list()).toHaveLength(1);   // table survived → queries are parameterized
```
Parameterized: `prepare('... WHERE id = ?').get(id)` ✅
String concatenation: `exec("... WHERE id = " + id)` ❌ vulnerable (see `05-Security-Testing`)

## Migrations
Real apps change their schema with **migrations** (Flyway, Liquibase, Prisma, Knex). Test that:
- All migrations run on an empty database
- The app works after migrating
- (Advanced) migrations work on a copy of production-like data

## Try it
1. Add a test: `update()` on a non-existent id returns `undefined`.
2. Add a `UNIQUE` constraint on `title` in `db.ts`. Write a test proving a duplicate insert throws. What should the API return in that case (400? 409?)?
3. Change `createdAt` mapping to read the wrong column (`row.createdAt`). Which test catches it? Would a unit test with a mocked repository catch it?
4. Implement the **transaction rollback** strategy: one shared DB in `beforeAll`, `db.exec('BEGIN')` in `beforeEach` and `db.exec('ROLLBACK')` in `afterEach`.
