// Ad-hoc SQL playground — practise queries without installing a database.
//   node query.mjs "SELECT * FROM orders LIMIT 3"
//   node query.mjs --schema
//   node query.mjs                      (runs a demo query)
import { createShopDb } from './src/shopDb.js';

const db = createShopDb();
const arg = process.argv.slice(2).join(' ').trim();

if (arg === '--schema' || arg === '-s') {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  for (const { name } of tables) {
    const cols = db.prepare(`PRAGMA table_info(${name})`).all();
    const count = db.prepare(`SELECT COUNT(*) c FROM ${name}`).get().c;
    console.log(`\n${name}  (${count} rows)`);
    cols.forEach((c) => console.log(`   ${c.name.padEnd(12)} ${c.type}${c.pk ? '  PK' : ''}${c.notnull ? '  NOT NULL' : ''}`));
  }
  process.exit(0);
}

const sql = arg || `
  SELECT o.id AS order_id, u.name AS customer, o.status, o.total,
         COUNT(oi.id) AS items
  FROM orders o
  LEFT JOIN users u ON u.id = o.user_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id ORDER BY o.id`;

console.log(`\nSQL: ${sql.trim().replace(/\s+/g, ' ').slice(0, 120)}...\n`);
try {
  const rows = db.prepare(sql).all();
  rows.length ? console.table(rows) : console.log('(no rows)');
  console.log(`${rows.length} row(s)\n`);
} catch (err) {
  console.error('SQL error:', err.message, '\n');
  process.exitCode = 1;
}
