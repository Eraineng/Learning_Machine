// JOINs, demonstrated with assertions instead of slides.
import { describe, it, expect, beforeEach } from 'vitest';
import { createShopDb, q } from '../src/shopDb.js';

let db;
beforeEach(() => {
  db = createShopDb();
});

describe('INNER JOIN — only rows that match on BOTH sides', () => {
  it('returns orders together with their user', () => {
    const rows = q(db, `
      SELECT o.id AS order_id, u.name, o.total
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.id
    `);

    // 9 orders exist, but order 105 points at a non-existent user → INNER JOIN drops it
    expect(rows).toHaveLength(8);
    expect(rows.map((r) => r.order_id)).not.toContain(105);
  });

  it('⚠️ THE CLASSIC TRAP: INNER JOIN silently HIDES broken data', () => {
    const allOrders = q(db, 'SELECT COUNT(*) AS c FROM orders')[0].c;
    const joined = q(db, 'SELECT COUNT(*) AS c FROM orders o INNER JOIN users u ON u.id = o.user_id')[0].c;

    expect(allOrders).toBe(9);
    expect(joined).toBe(8); // ← one order vanished from the report, and nobody notices
    // Lesson: if a report uses INNER JOIN, corrupt rows disappear instead of being flagged.
  });
});

describe('LEFT JOIN — ALL rows from the left table, NULLs where the right side is missing', () => {
  it('keeps every order, even the orphan one', () => {
    const rows = q(db, `
      SELECT o.id AS order_id, u.name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id
    `);

    expect(rows).toHaveLength(9); // nothing is lost
    expect(rows.find((r) => r.order_id === 105).name).toBeNull(); // the orphan is visible as NULL
  });

  it('⭐ LEFT JOIN + IS NULL = the "anti-join": find what is MISSING', () => {
    // This one query is the most valuable SQL pattern a tester can know.
    const orphanOrders = q(db, `
      SELECT o.id, o.user_id
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE u.id IS NULL
    `);
    expect(orphanOrders).toEqual([{ id: 105, user_id: 999 }]);

    const usersWithoutOrders = q(db, `
      SELECT u.id, u.email
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE o.id IS NULL
    `);
    expect(usersWithoutOrders.map((u) => u.id)).toEqual([5]); // the duplicate account never ordered

    // ⚠️ Put the condition in the ON clause instead and the meaning changes completely:
    const wrong = q(db, `
      SELECT u.id FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'cancelled'
      WHERE o.id IS NULL
    `);
    expect(wrong.map((u) => u.id)).toEqual([1, 2, 3, 5]); // "users with no CANCELLED order"
    // ON filters BEFORE the join, WHERE filters AFTER it — the #1 LEFT JOIN interview question.
  });
});

describe('RIGHT JOIN — ALL rows from the right table (the mirror of LEFT)', () => {
  it('is just LEFT JOIN with the tables swapped', () => {
    const right = q(db, `
      SELECT p.id AS product_id, oi.id AS item_id
      FROM order_items oi
      RIGHT JOIN products p ON p.id = oi.product_id
      ORDER BY p.id, oi.id
    `);
    const left = q(db, `
      SELECT p.id AS product_id, oi.id AS item_id
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      ORDER BY p.id, oi.id
    `);

    expect(right).toEqual(left); // identical results
    // That's why many teams (and older MySQL/SQLite versions) only ever use LEFT JOIN.
  });

  it('finds products nobody has ever ordered', () => {
    const neverOrdered = q(db, `
      SELECT p.id, p.name
      FROM order_items oi
      RIGHT JOIN products p ON p.id = oi.product_id
      WHERE oi.id IS NULL
    `);
    expect(neverOrdered).toEqual([{ id: 14, name: 'Discontinued Hoodie' }]);
  });
});

describe('FULL OUTER JOIN — everything from both sides', () => {
  it('shows unmatched rows on BOTH sides at once', () => {
    const rows = q(db, `
      SELECT o.id AS order_id, p.id AS payment_order
      FROM orders o
      FULL OUTER JOIN payments p ON p.order_id = o.id
      WHERE o.id IS NULL OR p.id IS NULL
      ORDER BY o.id
    `);

    // Orders with no payment (106, 107) — payments with no order would also appear here
    expect(rows.map((r) => r.order_id)).toEqual([106, 107]);
  });
});

describe('CROSS JOIN — every combination (rarely wanted, easy to cause by accident)', () => {
  it('multiplies the rows', () => {
    const users = q(db, 'SELECT COUNT(*) c FROM users')[0].c;
    const products = q(db, 'SELECT COUNT(*) c FROM products')[0].c;
    const cross = q(db, 'SELECT COUNT(*) c FROM users CROSS JOIN products')[0].c;

    expect(cross).toBe(users * products); // 5 × 5 = 25
    // ⚠️ Forgetting the ON clause creates this by accident → "why is my report 10x too big?"
  });
});

describe('SELF JOIN — a table joined to itself', () => {
  it('finds duplicate accounts (same email, different case)', () => {
    const duplicates = q(db, `
      SELECT a.id AS id_a, b.id AS id_b, a.email, b.email AS email_b
      FROM users a
      INNER JOIN users b ON LOWER(a.email) = LOWER(b.email) AND a.id < b.id
    `);
    expect(duplicates).toEqual([
      { id_a: 1, id_b: 5, email: 'ann@test.example', email_b: 'ANN@test.example' },
    ]);
  });
});

describe('multi-table JOIN — the query you will actually write at work', () => {
  it('joins 5 tables to build a full order picture', () => {
    const rows = q(db, `
      SELECT o.id              AS order_id,
             u.name            AS customer,
             COUNT(oi.id)      AS item_count,
             ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_total,
             o.total           AS order_total,
             p.amount          AS paid,
             s.carrier         AS shipped_with
      FROM orders o
      LEFT JOIN users       u  ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN payments    p  ON p.order_id = o.id AND p.status = 'captured'
      LEFT JOIN shipments   s  ON s.order_id = o.id
      GROUP BY o.id
      ORDER BY o.id
    `);

    expect(rows).toHaveLength(9);
    const order106 = rows.find((r) => r.order_id === 106);
    expect(order106.item_count).toBe(0); // empty order…
    expect(order106.shipped_with).toBe('DHL'); // …yet it shipped 🐞
  });

  it('⚠️ JOIN + aggregate trap: a second JOIN inflates SUM()', () => {
    // Order 102 has ONE item but TWO payment rows (the double charge).
    // Joining both and summing the items multiplies the item total by the number of payments.
    const wrong = q(db, `
      SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_total
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN payments    p  ON p.order_id = o.id
      WHERE o.id = 102
    `)[0].items_total;

    const right = q(db, `
      SELECT ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_total
      FROM order_items oi WHERE oi.order_id = 102
    `)[0].items_total;

    expect(wrong).toBe(25.0); // 🐞 12.50 counted twice
    expect(right).toBe(12.5);
    // Fix: aggregate in a subquery, or use DISTINCT / separate queries.
  });
});
