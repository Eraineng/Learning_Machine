# SQL for QA — Exercises

Run each with:
```powershell
npm run query -- "YOUR SQL HERE"
```
Check yourself against the answers at the bottom. Aim to write each one **before** looking.

## Level 1 — Basics
1. All orders with a total over €40, newest first.
2. How many users are there per country?
3. Every product with stock below 20.
4. Total captured revenue (all payments with status `captured`).
5. Orders created in August 2026, counted by status.

## Level 2 — JOINs
6. Every order with the customer's name and email.
7. Each customer and how many orders they placed — **including** customers with zero.
8. All order items with the product name and the line total (`quantity × unit_price`).
9. Products that have never been ordered.
10. Customers who have never ordered.
11. Every order with its captured payment amount, showing `NULL` when unpaid.
12. Orders together with their shipment carrier, including orders never shipped.

## Level 3 — Finding the defects (the real QA work)
13. Find orders whose `user_id` doesn't exist in `users`.
14. Find order items whose product no longer exists.
15. Find orders where `total` ≠ the sum of their items. Show the difference.
16. Find orders charged more than once (double charge).
17. Find orders marked `paid` or `shipped` with no captured payment.
18. Find products with negative stock.
19. Find cancelled orders where money was captured and never refunded.
20. Find duplicate user accounts by email, ignoring case.
21. Find orders with no items at all.
22. Find shipments whose order was never paid.

## Level 4 — Reporting & harder queries
23. Revenue per customer, highest first, including customers with €0.
24. For each product: units sold, revenue generated, and current stock.
25. Reconcile the books: total of `orders.total` for non-cancelled orders vs total captured payments. What's the gap, and which orders explain it?

## Level 5 — Beyond querying
26. Add a check to `data-audit.mjs` for "shipment exists for a cancelled order".
27. Write a Vitest test that fails if **any** product has negative stock, and add it to the pipeline in folder 14.
28. Using `BEGIN`/`ROLLBACK`, prove that a failed multi-step operation leaves no trace.
29. Simulate the overselling race condition: read stock, then update — and then write the safe atomic version.
30. For each of the 12 seeded defects, write a one-line bug report title (folder 16 style) and a severity.

---

## Answers
<details>
<summary>Show SQL</summary>

```sql
-- 1
SELECT * FROM orders WHERE total > 40 ORDER BY created_at DESC;
-- 2
SELECT country, COUNT(*) AS users FROM users GROUP BY country;
-- 3
SELECT * FROM products WHERE stock < 20 ORDER BY stock;
-- 4
SELECT ROUND(SUM(amount),2) AS revenue FROM payments WHERE status='captured';
-- 5
SELECT status, COUNT(*) FROM orders WHERE created_at BETWEEN '2026-08-01' AND '2026-08-31' GROUP BY status;

-- 6
SELECT o.id, u.name, u.email, o.total FROM orders o JOIN users u ON u.id=o.user_id;
-- 7
SELECT u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.id ORDER BY orders DESC;
-- 8
SELECT oi.id, p.name, oi.quantity, oi.unit_price, ROUND(oi.quantity*oi.unit_price,2) AS line_total
FROM order_items oi LEFT JOIN products p ON p.id=oi.product_id;
-- 9
SELECT p.id, p.name FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id WHERE oi.id IS NULL;
-- 10
SELECT u.id, u.email FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE o.id IS NULL;
-- 11
SELECT o.id, o.total, p.amount FROM orders o
LEFT JOIN payments p ON p.order_id=o.id AND p.status='captured';
-- 12
SELECT o.id, s.carrier FROM orders o LEFT JOIN shipments s ON s.order_id=o.id;

-- 13
SELECT o.id, o.user_id FROM orders o LEFT JOIN users u ON u.id=o.user_id WHERE u.id IS NULL;
-- 14
SELECT oi.id, oi.product_id FROM order_items oi LEFT JOIN products p ON p.id=oi.product_id WHERE p.id IS NULL;
-- 15
SELECT o.id, o.total, ROUND(SUM(oi.quantity*oi.unit_price),2) AS items_total,
       ROUND(o.total - SUM(oi.quantity*oi.unit_price),2) AS difference
FROM orders o JOIN order_items oi ON oi.order_id=o.id
GROUP BY o.id HAVING ROUND(o.total,2) <> ROUND(SUM(oi.quantity*oi.unit_price),2);
-- 16
SELECT order_id, COUNT(*) AS payments, ROUND(SUM(amount),2) AS charged
FROM payments WHERE status='captured' GROUP BY order_id HAVING COUNT(*)>1;
-- 17
SELECT o.id, o.status FROM orders o LEFT JOIN payments p ON p.order_id=o.id AND p.status='captured'
WHERE o.status IN ('paid','shipped') AND p.id IS NULL;
-- 18
SELECT * FROM products WHERE stock < 0;
-- 19
SELECT o.id, p.amount FROM orders o JOIN payments p ON p.order_id=o.id
WHERE o.status='cancelled' AND p.status='captured';
-- 20
SELECT LOWER(email) AS email, COUNT(*) AS accounts, GROUP_CONCAT(id) AS ids
FROM users GROUP BY LOWER(email) HAVING COUNT(*)>1;
-- 21
SELECT o.id FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE oi.id IS NULL;
-- 22
SELECT s.order_id FROM shipments s
LEFT JOIN payments p ON p.order_id=s.order_id AND p.status='captured' WHERE p.id IS NULL;

-- 23
SELECT u.name, ROUND(COALESCE(SUM(o.total),0),2) AS spend
FROM users u LEFT JOIN orders o ON o.user_id=u.id AND o.status<>'cancelled'
GROUP BY u.id ORDER BY spend DESC;
-- 24
SELECT p.name, COALESCE(SUM(oi.quantity),0) AS units_sold,
       ROUND(COALESCE(SUM(oi.quantity*oi.unit_price),0),2) AS revenue, p.stock
FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id GROUP BY p.id ORDER BY revenue DESC;
-- 25
SELECT (SELECT ROUND(SUM(total),2) FROM orders WHERE status<>'cancelled') AS orders_total,
       (SELECT ROUND(SUM(amount),2) FROM payments WHERE status='captured') AS captured_total;
-- the gap comes from orders 102 (double charge), 104 (underpaid), 107 (never paid), 108 (cancelled, not refunded)
```

</details>
