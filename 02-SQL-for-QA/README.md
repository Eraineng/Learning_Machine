# SQL for QA — Learning Roadmap

**The #1 non-automation skill asked for in QA interviews**, and the only way to prove what the backend
*actually* wrote after an API call. A 200 OK means nothing if the database row is wrong.

```
sql-project/
├── src/shopDb.js        e-commerce DB seeded with 12 REAL integrity defects
├── tests/
│   ├── 01-joins.test.js          INNER / LEFT / RIGHT / FULL / CROSS / SELF joins, with traps
│   └── 02-data-integrity.test.js orphans, dirty writes, double charges, invariants, transactions
├── data-audit.mjs       ✅ a nightly data-quality audit (12 checks, severity-rated)
└── query.mjs            ✅ ad-hoc SQL playground — no database install needed
```

## Setup (no database server required — Node 22 has SQLite built in)
```powershell
cd sql-project
npm install
npm test              # 26 tests: every JOIN and integrity check, proven
npm run audit         # the data-quality audit report
npm run query -- --schema
npm run query -- "SELECT * FROM orders LIMIT 5"
```

## The defects hidden in the seed data
| # | Defect | Found by |
|---|--------|----------|
| 1 | Order for a deleted user (orphan) | `LEFT JOIN … IS NULL` |
| 2 | Order item for a deleted product | `LEFT JOIN … IS NULL` |
| 3 | Order item for a non-existent order | `LEFT JOIN … IS NULL` |
| 4 | Order total ≠ sum of its items (customer overcharged €34) | `GROUP BY … HAVING` |
| 5 | Payment captured for the wrong amount | JOIN + comparison |
| 6 | **Double charge** on one order | `GROUP BY … HAVING COUNT(*) > 1` |
| 7 | Cancelled order, money never refunded | JOIN + status check |
| 8 | Shipped without payment | `LEFT JOIN payments … IS NULL` |
| 9 | Shipment for an empty, pending order | multi-table JOIN |
| 10 | Order with no items at all | anti-join |
| 11 | **Negative stock** (overselling) | simple `WHERE stock < 0` |
| 12 | Duplicate account, same email different case | SELF JOIN |

## Checklist
- [ ] `01-SQL-Basics-for-QA/lesson.md` — SELECT, WHERE, GROUP BY, the 10 statements you need
- [ ] `02-JOINs-Deep-Dive/lesson.md` — ⭐ interview answers for INNER vs LEFT vs RIGHT
- [ ] `03-Data-Verification-Workflows/lesson.md` — dirty writes, orphans, verifying an API call
- [ ] `04-Exercises/exercises.md` — 25 query challenges with answers
