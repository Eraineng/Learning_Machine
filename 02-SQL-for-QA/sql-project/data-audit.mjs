// A data-quality audit you could schedule nightly against a test (or read-replica) database.
// Run: npm run audit
import { createShopDb } from './src/shopDb.js';

const db = createShopDb();

const CHECKS = [
  {
    id: 'ORPHAN-001', severity: 'Major', name: 'order_items → missing order',
    sql: `SELECT oi.id, oi.order_id FROM order_items oi
          LEFT JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL`,
  },
  {
    id: 'ORPHAN-002', severity: 'Major', name: 'order_items → missing product',
    sql: `SELECT oi.id, oi.product_id FROM order_items oi
          LEFT JOIN products p ON p.id = oi.product_id WHERE p.id IS NULL`,
  },
  {
    id: 'ORPHAN-003', severity: 'Major', name: 'orders → missing user',
    sql: `SELECT o.id, o.user_id FROM orders o
          LEFT JOIN users u ON u.id = o.user_id WHERE u.id IS NULL`,
  },
  {
    id: 'MONEY-001', severity: 'Critical', name: 'order total ≠ sum of items',
    sql: `SELECT o.id, o.total, ROUND(SUM(oi.quantity * oi.unit_price),2) AS items_total
          FROM orders o JOIN order_items oi ON oi.order_id = o.id
          GROUP BY o.id HAVING ROUND(o.total,2) <> ROUND(SUM(oi.quantity*oi.unit_price),2)`,
  },
  {
    id: 'MONEY-002', severity: 'Critical', name: 'captured payment ≠ order total',
    sql: `SELECT o.id AS order_id, o.total, p.amount FROM orders o
          JOIN payments p ON p.order_id = o.id AND p.status='captured'
          WHERE ROUND(o.total,2) <> ROUND(p.amount,2)`,
  },
  {
    id: 'MONEY-003', severity: 'Critical', name: 'double charge (>1 captured payment)',
    sql: `SELECT order_id, COUNT(*) AS payments, ROUND(SUM(amount),2) AS charged
          FROM payments WHERE status='captured' GROUP BY order_id HAVING COUNT(*) > 1`,
  },
  {
    id: 'MONEY-004', severity: 'Critical', name: 'cancelled order not refunded',
    sql: `SELECT o.id, p.amount FROM orders o JOIN payments p ON p.order_id=o.id
          WHERE o.status='cancelled' AND p.status='captured'`,
  },
  {
    id: 'STATE-001', severity: 'Major', name: 'paid/shipped order without a payment',
    sql: `SELECT o.id, o.status FROM orders o
          LEFT JOIN payments p ON p.order_id=o.id AND p.status='captured'
          WHERE o.status IN ('paid','shipped') AND p.id IS NULL`,
  },
  {
    id: 'STATE-002', severity: 'Major', name: 'shipped before payment',
    sql: `SELECT s.order_id FROM shipments s
          LEFT JOIN payments p ON p.order_id=s.order_id AND p.status='captured' WHERE p.id IS NULL`,
  },
  {
    id: 'STATE-003', severity: 'Minor', name: 'order without items',
    sql: `SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE oi.id IS NULL`,
  },
  {
    id: 'STOCK-001', severity: 'Critical', name: 'negative stock (overselling)',
    sql: `SELECT id, name, stock FROM products WHERE stock < 0`,
  },
  {
    id: 'DUP-001', severity: 'Minor', name: 'duplicate accounts (same email)',
    sql: `SELECT LOWER(email) AS email, COUNT(*) AS accounts, GROUP_CONCAT(id) AS ids
          FROM users GROUP BY LOWER(email) HAVING COUNT(*) > 1`,
  },
];

console.log('\n════════ DATA QUALITY AUDIT ════════\n');
let failed = 0;
const summary = [];

for (const check of CHECKS) {
  const rows = db.prepare(check.sql).all();
  const ok = rows.length === 0;
  if (!ok) failed++;
  summary.push({ id: check.id, severity: check.severity, check: check.name, rows: rows.length, result: ok ? 'PASS' : 'FAIL' });

  console.log(`${ok ? '✅' : '❌'} [${check.severity.padEnd(8)}] ${check.id}  ${check.name}`);
  if (!ok) rows.slice(0, 5).forEach((r) => console.log(`        → ${JSON.stringify(r)}`));
}

console.log('\n──────── SUMMARY ────────');
console.table(summary);
const critical = summary.filter((s) => s.result === 'FAIL' && s.severity === 'Critical').length;
console.log(`${CHECKS.length - failed}/${CHECKS.length} checks passed · ${critical} CRITICAL failures`);
console.log(critical ? '\n❌ Data integrity is compromised — raise defects before release.\n'
                     : '\n✅ Data integrity checks passed.\n');
process.exitCode = failed ? 1 : 0;
