# Lesson 2 — JOINs Deep Dive ⭐ (interview topic #2 on your list)

📂 Proven in code: `sql-project/tests/01-joins.test.js` (run `npm test`)

## The one-sentence definitions (memorize these)
| JOIN | Returns | One-liner for an interview |
|------|---------|----------------------------|
| **INNER JOIN** | Only rows with a match in **both** tables | "Only the intersection — unmatched rows from either side are dropped." |
| **LEFT JOIN** (LEFT OUTER) | **All** rows from the left table + matches from the right; `NULL` where there's no match | "Everything on the left, filled in from the right where possible." |
| **RIGHT JOIN** (RIGHT OUTER) | **All** rows from the right table + matches from the left | "The mirror image of LEFT JOIN — rarely used, because you can just swap the tables." |
| **FULL OUTER JOIN** | All rows from both sides, NULLs where unmatched | "Everything from both, so you can see gaps on either side." |
| **CROSS JOIN** | Every combination (cartesian product) | "Rows × rows — usually an accident when you forget the ON clause." |
| **SELF JOIN** | A table joined to itself | "For comparing rows within one table, e.g. finding duplicates." |

## Visually
```
users            orders                INNER JOIN         LEFT JOIN
┌────┐           ┌──────────┐          ┌──────────┐      ┌───────────────┐
│ 1  │◄──────────│ o:100 u:1│          │ 1 ─ 100  │      │ 1 ─ 100       │
│ 2  │◄──────────│ o:101 u:2│    →     │ 2 ─ 101  │  →   │ 2 ─ 101       │
│ 5  │           │ o:105 u:999│        └──────────┘      │ 5 ─ NULL      │  ← kept!
└────┘           └──────────┘        (105 disappears)    └───────────────┘
```

## ⭐ Why this matters to QA (this is the answer that impresses)
> "INNER JOIN silently **hides** broken data; LEFT JOIN **reveals** it."

Our database has 9 orders. One belongs to a deleted user:
```sql
SELECT COUNT(*) FROM orders;                                          -- 9
SELECT COUNT(*) FROM orders o INNER JOIN users u ON u.id = o.user_id; -- 8  🐞
```
An order **vanished from the report** and nobody notices. If a revenue dashboard uses INNER JOIN,
orphaned orders are silently excluded from the revenue figure. That's a real, expensive class of bug.

## ⭐ The single most useful query pattern for testers: the ANTI-JOIN
**`LEFT JOIN` + `WHERE right_table.id IS NULL` = "find what's MISSING"**
```sql
-- Orders whose user no longer exists (orphans)
SELECT o.id, o.user_id
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE u.id IS NULL;

-- Users who never ordered (marketing wants these)
SELECT u.id, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- Paid orders with no payment record (money lost!)
SELECT o.id FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'captured'
WHERE o.status = 'paid' AND p.id IS NULL;
```
If you remember one thing from this folder, remember this pattern. It finds **orphans, missing side effects,
and skipped steps** — the exact defects that follow a half-failed backend operation.

## ⭐ ON vs WHERE in a LEFT JOIN (top interview trap)
```sql
-- A: condition in ON  → filters BEFORE joining; all users are still returned
SELECT u.id, o.id FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'cancelled';

-- B: condition in WHERE → filters AFTER joining; turns it into an INNER JOIN!
SELECT u.id, o.id FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'cancelled';
```
**A** = "all users, plus their cancelled orders if any."
**B** = "only users who have a cancelled order."
Putting a right-table condition in `WHERE` **silently destroys** your LEFT JOIN. Test `01-joins.test.js` proves it.

## RIGHT JOIN: what to say when asked
> "`A RIGHT JOIN B` is identical to `B LEFT JOIN A`. It's supported everywhere modern (SQLite 3.39+, MySQL,
> Postgres, SQL Server), but most teams standardize on LEFT JOIN for readability, because you read the query
> left to right. I use RIGHT JOIN mainly when I'm adding a table to an existing query and don't want to rewrite it."

Our test asserts they return identical rows — proof, not opinion.

## Traps that produce wrong test results
### 1. Row multiplication (the "my SUM is double" bug)
Order 102 has 1 item but 2 payment rows (a double charge). Join both and sum:
```sql
SELECT SUM(oi.quantity * oi.unit_price)      -- 25.00 🐞 (should be 12.50)
FROM orders o JOIN order_items oi ON oi.order_id=o.id
              JOIN payments p ON p.order_id=o.id
WHERE o.id = 102;
```
A one-to-many JOIN **duplicates** rows from the other side. Fix: aggregate in a subquery, or query separately.

### 2. Forgetting the ON clause → CROSS JOIN → 25 rows instead of 5.
### 3. Joining on a nullable column → NULL never matches NULL.
### 4. Case/whitespace mismatches → join on `LOWER(TRIM(email))`.

## Multi-table JOIN (what you'll actually write)
```sql
SELECT o.id AS order_id, u.name AS customer,
       COUNT(oi.id) AS items,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS items_total,
       o.total AS order_total,
       p.amount AS paid, s.carrier
FROM orders o
LEFT JOIN users       u  ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments    p  ON p.order_id = o.id AND p.status = 'captured'
LEFT JOIN shipments   s  ON s.order_id = o.id
GROUP BY o.id
ORDER BY o.id;
```
Use **LEFT JOIN by default when verifying data** — you want to see the gaps, not hide them.

## Interview answer template
> "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns everything from the left table
> with NULLs where the right has no match; RIGHT JOIN is the mirror of that. As a tester I mostly use LEFT JOIN,
> because combined with `IS NULL` it's how I find orphan records and missing side effects — for example a paid
> order with no payment row. I'm careful about two things: putting the right table's condition in `WHERE` instead
> of `ON`, which turns a LEFT JOIN into an INNER JOIN, and row multiplication when joining two one-to-many tables,
> which inflates aggregates."

## Try it
```powershell
npm test                                                  # see all of it proven
npm run query -- "SELECT u.name, COUNT(o.id) orders FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.id"
```
1. Write the anti-join that finds products never ordered.
2. Write the query that lists each customer with their total spend, **including** customers who spent nothing.
3. Reproduce the ON-vs-WHERE difference yourself and explain the two result sets out loud.
