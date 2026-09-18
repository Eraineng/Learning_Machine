# Lesson 1 — SQL Basics for QA

You don't need to be a DBA. You need ~10 building blocks to answer: **"did the backend really do what the UI claims?"**

## Why testers need SQL
| Situation | What SQL proves |
|-----------|-----------------|
| API returns `201 Created` | The row actually exists, with the right values |
| UI shows "order cancelled" | Status changed AND the payment was refunded |
| Bug report says "data missing" | Whether it's a display bug or truly missing data |
| Need 50 users in a specific state | Seed them directly instead of clicking 50 times |
| Migration/release just ran | Nothing was corrupted, no orphans appeared |
| Report totals look wrong | Compare the report against the raw data |

## The query skeleton (learn this order — it's also the execution order)
```sql
SELECT   columns              -- 5. what to show
FROM     table                -- 1. where from
JOIN     other ON condition   -- 2. combine tables
WHERE    row_filter           -- 3. filter ROWS (before grouping)
GROUP BY column               -- 4. collapse rows into groups
HAVING   group_filter         -- 4b. filter GROUPS (after aggregation)
ORDER BY column DESC          -- 6. sort
LIMIT    10;                  -- 7. cap the output
```
⭐ **WHERE filters rows, HAVING filters groups.** Classic interview question.

## The essentials
```sql
-- filtering
WHERE status = 'paid'
WHERE total > 50 AND country = 'DE'
WHERE status IN ('paid','shipped')
WHERE created_at BETWEEN '2026-08-01' AND '2026-08-31'
WHERE email LIKE '%@test.example'        -- % = any characters
WHERE deleted_at IS NULL                 -- ⚠️ never  = NULL
WHERE LOWER(email) = 'ann@test.example'  -- case-insensitive matching

-- aggregates (one row per group)
SELECT status, COUNT(*) AS orders, SUM(total) AS revenue, AVG(total) AS avg_order,
       MIN(created_at) AS first_order, MAX(total) AS biggest
FROM orders GROUP BY status;

-- de-duplicate
SELECT DISTINCT country FROM users;

-- sort + limit (find the newest rows after a test run)
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- subquery
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE country = 'DE');

-- CASE: turn values into labels
SELECT id, CASE WHEN total > 50 THEN 'big' ELSE 'small' END AS size FROM orders;
```

## NULL: the thing that catches everyone
```sql
WHERE x = NULL      -- ❌ never true, not even for NULLs
WHERE x IS NULL     -- ✅
WHERE x <> 'paid'   -- ⚠️ rows where x IS NULL are EXCLUDED
WHERE x <> 'paid' OR x IS NULL   -- ✅ what you usually meant
COUNT(*)            -- counts rows
COUNT(column)       -- ignores NULLs  ← different numbers, common bug in reports
COALESCE(x, 0)      -- replace NULL with a default
```
A huge share of "the report is wrong" defects are NULL-handling bugs.

## Writing data (careful — this changes state)
```sql
INSERT INTO users (email, name, created_at) VALUES ('t@test.example','T','2026-09-18');
UPDATE orders SET status = 'cancelled' WHERE id = 105;
DELETE FROM orders WHERE id = 105;
```
### 🚨 Safety rules for testers
1. **Always `SELECT` first with the same `WHERE`** — see exactly which rows you're about to change
2. Wrap in a transaction so you can undo:
   ```sql
   BEGIN;
   UPDATE orders SET status='cancelled' WHERE id = 105;
   SELECT * FROM orders WHERE id = 105;   -- check
   ROLLBACK;  -- or COMMIT
   ```
3. Never run `UPDATE`/`DELETE` without a `WHERE` (the classic career-limiting mistake)
4. **Never write to production.** Read-only access there, always.

## Reading a schema
```powershell
npm run query -- --schema
```
Look for: primary keys, foreign keys, NOT NULL, UNIQUE, defaults, and columns like
`deleted_at` (soft delete) or `status` (state machine → see folder 15 state transition testing).

## Practical tips
- `SELECT *` while exploring; name columns in saved/automated queries
- Use `LIMIT` while exploring a big table — don't pull 10M rows
- Save your useful queries in a file next to your tests (ours are in `data-audit.mjs`)
- Ask for a **read-only account** and a **read replica** for verification

## Try it
```powershell
npm run query -- --schema
npm run query -- "SELECT status, COUNT(*) c, ROUND(SUM(total),2) revenue FROM orders GROUP BY status"
npm run query -- "SELECT * FROM products WHERE stock < 5 ORDER BY stock"
```
1. Which order has the highest total? Which customer placed it?
2. How many orders did each country's customers place? (needs a JOIN — next lesson)
3. Find every payment captured on 2026-08-05.
