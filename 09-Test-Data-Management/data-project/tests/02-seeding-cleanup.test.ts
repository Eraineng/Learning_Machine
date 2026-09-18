import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDb, insertUser, countUsers, truncateAll, DataTracker } from '../src/database';
import { buildUser, buildUsers, resetIds, seedFaker } from '../src/factories';

beforeEach(() => {
  resetIds();
  seedFaker();
});

describe('strategy 1: fresh database per test', () => {
  let db: ReturnType<typeof createDb>;
  beforeEach(() => {
    db = createDb(); // nothing to clean up: perfect isolation
  });

  it('starts empty', () => {
    expect(countUsers(db)).toBe(0);
  });

  it('is unaffected by the previous test', () => {
    insertUser(db, buildUser());
    expect(countUsers(db)).toBe(1);
  });
});

describe('strategy 2: shared database + truncate between tests', () => {
  const db = createDb();
  afterEach(() => truncateAll(db)); // ⚠️ not safe if tests run in parallel against the same DB

  it('test A leaves no trace', () => {
    buildUsers(3).forEach((u) => insertUser(db, u));
    expect(countUsers(db)).toBe(3);
  });

  it('test B sees a clean database', () => {
    expect(countUsers(db)).toBe(0);
  });
});

describe('strategy 3: track and delete only what this test created', () => {
  const db = createDb();
  const tracker = new DataTracker();

  // Pre-existing "reference data" that must survive (like a shared staging environment)
  const permanent = insertUser(db, buildUser({ id: 9000, email: 'permanent@test.example' }));

  afterEach(() => tracker.cleanup(db));

  it('cleans up its own data but keeps shared data', () => {
    tracker.track(insertUser(db, buildUser()));
    tracker.track(insertUser(db, buildUser()));
    expect(countUsers(db)).toBe(3);
  });

  it('next test only sees the permanent user', () => {
    expect(countUsers(db)).toBe(1);
    expect((db.prepare('SELECT email FROM users').get() as any).email).toBe(permanent.email);
  });
});

describe('strategy 4: unique data, no cleanup at all', () => {
  const db = createDb();
  // ⚠️ TRAP: the global beforeEach calls resetIds() AND seedFaker(), so every test regenerates the
  // SAME ids and the SAME "random" emails → UNIQUE violations in a shared database.
  // Deterministic data and shared state pull in opposite directions. Real projects solve this with
  // UUIDs, database-generated ids, or a run-scoped prefix — as here:
  let uniqueId = 90_000;
  const uniqueUser = () => {
    const id = ++uniqueId;
    return buildUser({ id, email: `user${id}@test.example` });
  };

  it('two tests can run in parallel without colliding', () => {
    const a = insertUser(db, uniqueUser()); // unique id + email
    const b = insertUser(db, uniqueUser());
    expect(a.email).not.toBe(b.email);
    expect(a.id).not.toBe(b.id);
  });

  it('but the database grows forever — plan a periodic purge', () => {
    insertUser(db, uniqueUser());
    expect(countUsers(db)).toBeGreaterThan(1); // data from the previous test is still here
  });
});

describe('a duplicate seed fails loudly (why unique data matters)', () => {
  it('inserting the same email twice violates UNIQUE', () => {
    const db = createDb();
    const user = buildUser({ email: 'fixed@test.example' });
    insertUser(db, user);

    expect(() => insertUser(db, { ...buildUser(), email: 'fixed@test.example' })).toThrow(/UNIQUE/);
  });
});
