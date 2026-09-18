# Lesson 3 — Data Verification Workflows

📂 Proven in code: `sql-project/tests/02-data-integrity.test.js`, `data-audit.mjs`

## The core QA workflow: BEFORE → ACT → AFTER
Never verify only what the API response says. Verify **every side effect**.

```
1. BEFORE  snapshot the state      SELECT stock FROM products WHERE id=10;  → 40
2. ACT     call the API            POST /orders {product:10, qty:2}  → 201
3. AFTER   verify ALL side effects
           ├── order row created with the right user/status/total
           ├── order_items rows created, totals match
           ├── payment captured for exactly the order total
           ├── stock decreased by exactly 2   ← the one everyone forgets
           └── nothing else changed (no duplicate rows, no other user's data touched)
```

A test that only checks `response.status === 201` passes while the stock is never decremented.
That bug ships, and three weeks later you have **negative stock and oversold products** (defect #11 in our data).

## The three defect families you find with SQL
### 1. Orphan records (broken referential integrity)
A child row whose parent is gone: order items for a deleted order, orders for a deleted user.
**Causes:** deletes without cascade, missing foreign keys, failed multi-step operations, bad data migrations.
**Find them:**
```sql
SELECT child.* FROM child LEFT JOIN parent ON parent.id = child.parent_id WHERE parent.id IS NULL;
```
**Real fix:** enable foreign keys / add constraints — cleanup scripts only treat the symptom.
> ⚠️ Adding constraints later does **not** validate existing rows (our `enforceForeignKeys` test shows this).
> Legacy corruption still has to be found with queries.

### 2. Dirty writes (partial / inconsistent updates)
The operation half-succeeded, so the data contradicts itself:
| Symptom | Query pattern |
|---------|---------------|
| Order total ≠ sum of items | `GROUP BY o.id HAVING o.total <> SUM(...)` |
| Payment amount ≠ order total | JOIN + compare |
| Double charge | `GROUP BY order_id HAVING COUNT(*) > 1` |
| Status says paid, no payment row | anti-join |
| Cancelled but not refunded | JOIN + status combination |

**Root cause is almost always a missing transaction or a missing idempotency key.**
```sql
BEGIN;
  INSERT INTO orders ...;
  INSERT INTO order_items ...;
  UPDATE products SET stock = stock - 2 ...;
  INSERT INTO payments ...;
COMMIT;             -- all of it, or none of it
```
Our test `a ROLLED BACK transaction must leave NO trace` demonstrates the protection this gives.

### 3. Broken business invariants
Rules that must **always** be true, whatever path the code took:
- stock ≥ 0
- every paid order has exactly one captured payment
- nothing ships before payment
- a cancelled order holds no captured money
- every order has ≥ 1 item
- `sum(order_items) = order.total`

Write these as SQL checks **once**, then run them after every test run, every release, or nightly.
That's `data-audit.mjs` — 12 checks, severity-rated, exits non-zero on failure so **CI can run it**.

```powershell
npm run audit
```
```
❌ [Critical] MONEY-003  double charge (>1 captured payment)
        → {"order_id":102,"payments":2,"charged":25}
```

## Testing concurrency at the data layer
Two requests at once are how overselling happens:
```sql
-- ❌ read-then-write (race condition)
SELECT stock FROM products WHERE id = 12;          -- both see 1
UPDATE products SET stock = 0 WHERE id = 12;       -- both write 0 → 2 items sold, 1 in stock

-- ✅ atomic, conditional update
UPDATE products SET stock = stock - 1 WHERE id = 12 AND stock >= 1;
-- then check the affected row count: 0 means "sold out", reject the order
```
You'll exploit exactly this in the flight-booking lab (`03-Interview-Prep/flight-booking-lab`).

## Where SQL fits with the other folders
| Folder | How SQL is used |
|--------|-----------------|
| 01 API testing | Verify what the endpoint wrote, not just the response body |
| 04 Integration | Seed state fast, assert side effects (our `02-api-to-db.test.ts` already does this) |
| 11 Test data | Seed, clean up, check isolation, find leftover data |
| 12 CI/CD | Run `data-audit.mjs` as a pipeline job |
| 14 Reporting | Turn findings into defects with exact rows as evidence |

## Getting access safely
- Ask for **read-only** credentials on the test/staging DB (and a read replica if it exists)
- Tools: DBeaver (free, all databases), pgAdmin, MySQL Workbench, Azure Data Studio, or `psql`/`mysql` CLI
- Never run `UPDATE`/`DELETE` on shared environments without telling the team
- Production: read-only, masked, and only if policy allows (folder 09 lesson 4)

## Try it
```powershell
npm run audit
npm test
```
1. Add a 13th check to `data-audit.mjs`: "a shipment must not exist for a cancelled order".
2. Write the query that reconciles total revenue two ways (sum of `orders.total` vs sum of captured payments). By how much do they disagree, and which orders cause it?
3. For each of the 12 defects, write one sentence on the **likely root cause in the code**.
4. Pick 3 checks and write them as a Vitest test file that could run in CI after every deploy.
