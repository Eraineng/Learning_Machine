# Topic 2 — SQL JOINs: Interview Answers ⭐

**Full hands-on lessons + 26 proven tests:** [`../../02-SQL-for-QA/`](../../02-SQL-for-QA/)
This page is the condensed version to rehearse out loud.

## The 30-second definitions
| JOIN | Returns |
|------|---------|
| **INNER JOIN** | Only rows that have a match in **both** tables (the intersection) |
| **LEFT JOIN** | **All** rows from the left table, plus matching right-table data, `NULL` where there's no match |
| **RIGHT JOIN** | **All** rows from the right table, plus matching left-table data — the mirror of LEFT |
| FULL OUTER | Everything from both sides, NULLs where unmatched |
| CROSS | Every combination (cartesian product) |
| SELF | A table joined to itself, e.g. to find duplicates |

```sql
SELECT o.id, u.name
FROM orders o
LEFT JOIN users u ON u.id = o.user_id;   -- keeps orders whose user was deleted
```

## ⭐ The QA-specific answer (this is what makes you stand out)
> "The practical difference for a tester is that **INNER JOIN hides broken data and LEFT JOIN exposes it**.
> If I have 9 orders and one belongs to a deleted user, `INNER JOIN users` returns 8 — the bad row silently
> disappears from the report, and revenue is understated. With `LEFT JOIN` I still see all 9, with NULL for
> the missing user."

## ⭐ The single most useful pattern: the anti-join
```sql
-- "Find what's MISSING" — orphans, skipped steps, missing side effects
SELECT o.id
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'captured'
WHERE p.id IS NULL AND o.status = 'paid';     -- paid orders with no payment record
```
Use it for: orphan records, users who never ordered, products never sold, orders never shipped,
API calls whose side effect never happened.

## The two traps interviewers love
### 1. `ON` vs `WHERE` in a LEFT JOIN
```sql
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'cancelled'  -- all users, cancelled orders attached
LEFT JOIN orders o ON o.user_id = u.id WHERE o.status = 'cancelled' -- ⚠️ becomes an INNER JOIN
```
A condition on the right table in `WHERE` removes the NULL rows, silently destroying the LEFT JOIN.

### 2. Row multiplication inflates aggregates
Joining two one-to-many tables (items **and** payments) duplicates rows, so `SUM()` is too high.
Fix with subqueries or separate queries. Proven in `02-SQL-for-QA/sql-project/tests/01-joins.test.js`.

## Quick-fire Q&A
| Question | Answer |
|----------|--------|
| "Difference between WHERE and HAVING?" | WHERE filters rows before grouping; HAVING filters groups after aggregation |
| "How do you find duplicates?" | `GROUP BY col HAVING COUNT(*) > 1` (or a SELF JOIN on `LOWER(email)`) |
| "How do you find orphan records?" | LEFT JOIN the parent + `WHERE parent.id IS NULL` |
| "Why not `WHERE col = NULL`?" | NULL is unknown; nothing equals it. Use `IS NULL` |
| "COUNT(*) vs COUNT(col)?" | `COUNT(col)` ignores NULLs — a classic reporting bug |
| "Do you use RIGHT JOIN?" | Rarely — `A RIGHT JOIN B` ≡ `B LEFT JOIN A`; teams standardize on LEFT for readability |
| "How do you verify an API call with SQL?" | Snapshot before, call the API, then assert every side effect: row created, totals match, stock decremented, no duplicates |
| "Would you run UPDATE on production?" | No. Read-only access on production; on test environments, SELECT first with the same WHERE, then wrap in a transaction |

## The verification story to tell
> "After a `POST /orders` returns 201 I don't stop at the status code. I query the database: the order row
> exists with the right user and status, the order_items rows sum to the order total, a captured payment exists
> for exactly that amount, and the product stock decreased by the quantity ordered. That last one is the check
> people forget — and it's how you catch overselling before customers do."

## Practice before the interview
```powershell
cd ../../02-SQL-for-QA/sql-project
npm install && npm test      # 26 tests proving every statement above
npm run audit                # 12 data-quality checks against seeded defects
npm run query -- "SELECT ..." # your own queries
```
Do exercises 13–22 in `02-SQL-for-QA/04-Exercises/exercises.md` — those *are* the interview questions.
