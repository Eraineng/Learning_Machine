// The QA queries: finding orphans, dirty writes, and broken business invariants.
// Each test is a data-quality CHECK you could run after a release or in a nightly job.
import { describe, it, expect, beforeEach } from 'vitest';
import { createShopDb, q } from '../src/shopDb.js';

let db;
beforeEach(() => {
  db = createShopDb();
});

describe('orphan records (referential integrity)', () => {
  it('order_items pointing at a deleted order', () => {
    const orphans = q(db, `
      SELECT oi.id, oi.order_id
      FROM order_items oi
      LEFT JOIN orders o ON o.id = oi.order_id
      WHERE o.id IS NULL
    `);
    expect(orphans).toEqual([{ id: 1010, order_id: 555 }]);
  });

  it('order_items pointing at a deleted product', () => {
    const orphans = q(db, `
      SELECT oi.id, oi.product_id
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE p.id IS NULL
    `);
    expect(orphans).toEqual([{ id: 1009, product_id: 99 }]);
  });

  it('orders belonging to a deleted user', () => {
    const orphans = q(db, `
      SELECT o.id FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE u.id IS NULL
    `);
    expect(orphans.map((o) => o.id)).toEqual([105]);
  });

  it('with foreign keys ENABLED the bad insert is rejected at write time', () => {
    const strict = createShopDb({ enforceForeignKeys: true });
    expect(() =>
      strict.prepare('INSERT INTO orders (id, user_id, status, total, created_at) VALUES (200, 777, ?, ?, ?)')
        .run('paid', 10, '2026-09-01'),
    ).toThrow(/FOREIGN KEY/i);
    // 👉 The real fix for orphans is constraints, not cleanup scripts.
  });
});

describe('dirty writes / partial updates (the state after a half-failed operation)', () => {
  it('order total does not match the sum of its items', () => {
    const mismatched = q(db, `
      SELECT o.id,
             o.total                                     AS order_total,
             ROUND(SUM(oi.quantity * oi.unit_price), 2)  AS items_total,
             ROUND(o.total - SUM(oi.quantity * oi.unit_price), 2) AS difference
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      HAVING ROUND(o.total, 2) <> ROUND(SUM(oi.quantity * oi.unit_price), 2)
    `);

    expect(mismatched).toEqual([
      { id: 103, order_total: 100, items_total: 66, difference: 34 },
      { id: 107, order_total: 60, items_total: 60.0, difference: 0 },
    ].filter((r) => r.difference !== 0));
    expect(mismatched[0].id).toBe(103); // customer was charged 34.00 too much
  });

  it('payment amount does not match the order total', () => {
    const mismatched = q(db, `
      SELECT o.id AS order_id, o.total, p.amount, p.id AS payment_id
      FROM orders o
      JOIN payments p ON p.order_id = o.id AND p.status = 'captured'
      WHERE ROUND(o.total, 2) <> ROUND(p.amount, 2)
    `);
    expect(mismatched).toEqual([{ order_id: 104, total: 45, amount: 20, payment_id: 2005 }]);
  });

  it('DOUBLE CHARGE: more than one captured payment for the same order', () => {
    const doubles = q(db, `
      SELECT order_id, COUNT(*) AS payments, ROUND(SUM(amount), 2) AS charged
      FROM payments
      WHERE status = 'captured'
      GROUP BY order_id
      HAVING COUNT(*) > 1
    `);
    expect(doubles).toEqual([{ order_id: 102, payments: 2, charged: 25.0 }]);
    // Root cause is usually a retry or a double-clicked submit without idempotency.
  });

  it('duplicate user accounts (case-insensitive email)', () => {
    const dupes = q(db, `
      SELECT LOWER(email) AS email, COUNT(*) AS accounts, GROUP_CONCAT(id) AS ids
      FROM users GROUP BY LOWER(email) HAVING COUNT(*) > 1
    `);
    expect(dupes).toEqual([{ email: 'ann@test.example', accounts: 2, ids: '1,5' }]);
  });
});

describe('business invariants (rules that must ALWAYS hold)', () => {
  it('no product may have negative stock (overselling)', () => {
    const oversold = q(db, 'SELECT id, name, stock FROM products WHERE stock < 0');
    expect(oversold).toEqual([{ id: 12, name: 'Laptop Stand', stock: -3 }]);
  });

  it('a paid order must have a captured payment', () => {
    const unpaidButPaid = q(db, `
      SELECT o.id, o.status, o.total
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'captured'
      WHERE o.status IN ('paid', 'shipped') AND p.id IS NULL
    `);
    expect(unpaidButPaid).toEqual([{ id: 107, status: 'shipped', total: 60 }]);
  });

  it('nothing may ship before it is paid', () => {
    const shippedUnpaid = q(db, `
      SELECT s.order_id, o.status
      FROM shipments s
      JOIN orders o ON o.id = s.order_id
      LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'captured'
      WHERE p.id IS NULL
    `);
    expect(shippedUnpaid.map((r) => r.order_id).sort()).toEqual([106, 107]);
  });

  it('a cancelled order must not keep the customer money', () => {
    const notRefunded = q(db, `
      SELECT o.id, o.status, p.amount, p.status AS payment_status
      FROM orders o
      JOIN payments p ON p.order_id = o.id
      WHERE o.status = 'cancelled' AND p.status = 'captured'
    `);
    expect(notRefunded).toEqual([{ id: 108, status: 'cancelled', amount: 25, payment_status: 'captured' }]);
  });

  it('an order must contain at least one item', () => {
    const empty = q(db, `
      SELECT o.id FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE oi.id IS NULL
    `);
    expect(empty.map((o) => o.id)).toEqual([106]);
  });
});

describe('verifying a backend operation end to end (the QA workflow)', () => {
  it('BEFORE / ACT / AFTER: a correct order creation passes every check', () => {
    // 1. BEFORE — capture the state
    const before = {
      orders: q(db, 'SELECT COUNT(*) c FROM orders')[0].c,
      stock: q(db, 'SELECT stock FROM products WHERE id = 10')[0].stock,
    };

    // 2. ACT — simulate what the API does (in one transaction, like production should)
    db.exec('BEGIN');
    db.prepare('INSERT INTO orders (id, user_id, status, total, created_at) VALUES (300, 1, ?, ?, ?)')
      .run('paid', 25.0, '2026-09-18');
    db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (1100, 300, 10, 2, 12.5)').run();
    db.prepare('UPDATE products SET stock = stock - 2 WHERE id = 10').run();
    db.prepare("INSERT INTO payments (id, order_id, amount, status, paid_at) VALUES (2100, 300, 25.0, 'captured', '2026-09-18T10:00:00Z')").run();
    db.exec('COMMIT');

    // 3. AFTER — verify every side effect, not just the one you were told about
    const after = q(db, `
      SELECT o.id, o.total,
             (SELECT ROUND(SUM(quantity * unit_price), 2) FROM order_items WHERE order_id = o.id) AS items_total,
             (SELECT ROUND(SUM(amount), 2) FROM payments WHERE order_id = o.id AND status = 'captured') AS paid,
             (SELECT stock FROM products WHERE id = 10) AS stock_now
      FROM orders o WHERE o.id = 300
    `)[0];

    expect(q(db, 'SELECT COUNT(*) c FROM orders')[0].c).toBe(before.orders + 1);
    expect(after.items_total).toBe(after.total); // totals agree
    expect(after.paid).toBe(after.total); // money agrees
    expect(after.stock_now).toBe(before.stock - 2); // inventory agrees
  });

  it('a ROLLED BACK transaction must leave NO trace (this is what prevents dirty writes)', () => {
    const before = q(db, 'SELECT stock FROM products WHERE id = 11')[0].stock;

    db.exec('BEGIN');
    db.prepare('INSERT INTO orders (id, user_id, status, total, created_at) VALUES (301, 1, ?, ?, ?)').run('pending', 20, '2026-09-18');
    db.prepare('UPDATE products SET stock = stock - 1 WHERE id = 11').run();
    db.exec('ROLLBACK'); // e.g. the payment step failed

    expect(q(db, 'SELECT id FROM orders WHERE id = 301')).toEqual([]);
    expect(q(db, 'SELECT stock FROM products WHERE id = 11')[0].stock).toBe(before);
    // 👉 If your app does NOT use a transaction here, you get order 106: an order with no items.
  });
});
