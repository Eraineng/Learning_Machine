// An e-commerce database seeded with REAL data-integrity problems that QA finds with SQL.
// Every defect below is one you will meet in a live system after a failed/partial backend operation.
import { DatabaseSync } from 'node:sqlite';

export function createShopDb({ enforceForeignKeys = false } = {}) {
  // ⚠️ node:sqlite turns foreign keys ON by default, so we must switch them off to be able to
  // seed the broken rows below. (Plain SQLite has them OFF by default — check your own database:
  //   PRAGMA foreign_keys;   → 0 means nothing stops orphans from being written.)
  const db = new DatabaseSync(':memory:', { enableForeignKeyConstraints: false });

  // ⚠️ Foreign keys are OFF while seeding — that is how the broken rows below can exist at all,
  // and exactly how orphans appear in real systems where constraints were never enabled.
  db.exec(`
    CREATE TABLE users (
      id         INTEGER PRIMARY KEY,
      email      TEXT NOT NULL,
      name       TEXT NOT NULL,
      country    TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE products (
      id    INTEGER PRIMARY KEY,
      name  TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    );

    CREATE TABLE orders (
      id         INTEGER PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id),
      status     TEXT NOT NULL,              -- pending | paid | shipped | cancelled
      total      REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE order_items (
      id         INTEGER PRIMARY KEY,
      order_id   INTEGER REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      quantity   INTEGER NOT NULL,
      unit_price REAL NOT NULL
    );

    CREATE TABLE payments (
      id         INTEGER PRIMARY KEY,
      order_id   INTEGER REFERENCES orders(id),
      amount     REAL NOT NULL,
      status     TEXT NOT NULL,              -- captured | failed | refunded
      paid_at    TEXT
    );

    CREATE TABLE shipments (
      id        INTEGER PRIMARY KEY,
      order_id  INTEGER REFERENCES orders(id),
      carrier   TEXT NOT NULL,
      shipped_at TEXT NOT NULL
    );
  `);

  // ── users ───────────────────────────────────────────────────────────────────
  db.exec(`
    INSERT INTO users (id, email, name, country, created_at) VALUES
      (1, 'ann@test.example',   'Ann Tester',  'DE', '2026-01-10'),
      (2, 'bob@test.example',   'Bob Builder', 'FR', '2026-02-02'),
      (3, 'cara@test.example',  'Cara Coder',  'DE', '2026-02-20'),
      (4, 'dan@test.example',   'Dan Dev',     'US', '2026-03-01'),  -- only a cancelled order (108)
      (5, 'ANN@test.example',   'Ann Tester',  'DE', '2026-03-15');  -- 🐞 duplicate account, different case
  `);

  // ── products (note the negative stock) ──────────────────────────────────────
  db.exec(`
    INSERT INTO products (id, name, price, stock) VALUES
      (10, 'Blue Mug',      12.50,  40),
      (11, 'T-Shirt',       20.00,  15),
      (12, 'Laptop Stand',  45.00,  -3),   -- 🐞 negative stock = overselling
      (13, 'Sticker Pack',   3.00, 500),
      (14, 'Discontinued Hoodie', 55.00, 0); -- never ordered
  `);

  // ── orders ──────────────────────────────────────────────────────────────────
  db.exec(`
    INSERT INTO orders (id, user_id, status, total, created_at) VALUES
      (100, 1,    'paid',      45.00, '2026-08-01'),
      (101, 2,    'shipped',   40.00, '2026-08-03'),
      (102, 1,    'paid',      12.50, '2026-08-05'),
      (103, 3,    'paid',     100.00, '2026-08-07'),  -- 🐞 total ≠ sum(items) (items = 66.00)
      (104, 2,    'paid',      45.00, '2026-08-09'),  -- 🐞 payment captured for a different amount
      (105, 999,  'paid',      20.00, '2026-08-11'),  -- 🐞 orphan: user 999 does not exist
      (106, 3,    'pending',    0.00, '2026-08-12'),  -- 🐞 order with no items at all
      (107, 1,    'shipped',   60.00, '2026-08-14'),  -- 🐞 shipped but never paid
      (108, 4,    'cancelled', 25.00, '2026-08-15');  -- cancelled, but see payments…
  `);

  // ── order_items ─────────────────────────────────────────────────────────────
  db.exec(`
    INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
      (1000, 100, 12, 1, 45.00),
      (1001, 101, 11, 2, 20.00),
      (1002, 102, 10, 1, 12.50),
      (1003, 103, 11, 3, 20.00),
      (1004, 103, 13, 2,  3.00),   -- order 103 items total 66.00, order says 100.00
      (1005, 104, 12, 1, 45.00),
      (1006, 105, 11, 1, 20.00),
      (1007, 107, 12, 1, 45.00),
      (1008, 107, 13, 5,  3.00),
      (1009, 108, 99, 1, 25.00),   -- 🐞 orphan: product 99 does not exist
      (1010, 555, 10, 1, 12.50);   -- 🐞 orphan: order 555 does not exist
  `);

  // ── payments ────────────────────────────────────────────────────────────────
  db.exec(`
    INSERT INTO payments (id, order_id, amount, status, paid_at) VALUES
      (2000, 100, 45.00, 'captured', '2026-08-01T10:00:00Z'),
      (2001, 101, 40.00, 'captured', '2026-08-03T11:00:00Z'),
      (2002, 102, 12.50, 'captured', '2026-08-05T09:30:00Z'),
      (2003, 102, 12.50, 'captured', '2026-08-05T09:30:40Z'),  -- 🐞 DOUBLE CHARGE (double-click / retry)
      (2004, 103,100.00, 'captured', '2026-08-07T14:00:00Z'),
      (2005, 104, 20.00, 'captured', '2026-08-09T16:00:00Z'),  -- 🐞 paid 20.00 for a 45.00 order
      (2006, 105, 20.00, 'captured', '2026-08-11T12:00:00Z'),
      (2007, 108, 25.00, 'captured', '2026-08-15T08:00:00Z');  -- 🐞 order cancelled, money not refunded
  `);

  // ── shipments ───────────────────────────────────────────────────────────────
  db.exec(`
    INSERT INTO shipments (id, order_id, carrier, shipped_at) VALUES
      (3000, 101, 'DHL', '2026-08-04'),
      (3001, 107, 'UPS', '2026-08-15'),   -- shipped although unpaid
      (3002, 106, 'DHL', '2026-08-13');   -- 🐞 shipment for an EMPTY, still-pending order
  `);

  // Constraints switched on AFTER the data exists: new bad writes are blocked, but the
  // existing orphans survive. That is precisely what happens when a team adds foreign keys
  // to a legacy database — the old corrupt rows still need finding with the queries in tests/.
  if (enforceForeignKeys) db.exec('PRAGMA foreign_keys = ON');

  return db;
}

/** Small helper so tests and scripts read the same way. */
export const q = (db, sql, ...params) => db.prepare(sql).all(...params);
export const one = (db, sql, ...params) => db.prepare(sql).get(...params);
