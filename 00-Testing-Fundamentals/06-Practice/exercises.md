# Testing Fundamentals — Practice Exercises

Save your work in `06-Practice/my-answers.md`.

---

## Exercise 1 — Error, defect, failure (5 min)
A requirement says: *"Orders over $100 get free shipping."*
The developer writes `if (total > 1000)`.
- Identify the error, the defect, and the failure.
- A customer orders $100.00 exactly. Should they get free shipping? What should you ask the product owner?

## Exercise 2 — Classify the test (10 min)
For each, write the **level** (unit/integration/system/acceptance) and **type** (functional/non-functional, smoke/sanity/regression/…).
1. A developer checks `formatPrice(1234.5)` returns `"$1,234.50"`.
2. After deployment, a tester quickly checks the homepage, login and search all open.
3. The API `POST /orders` really creates a row in the `orders` table.
4. The client's finance team confirms the monthly report matches their spreadsheet.
5. 5,000 virtual users browse products at the same time.
6. After a bug fix in the cart, the tester re-runs all 200 checkout tests.
7. A blind user navigates the signup page with a screen reader.

## Exercise 3 — EP & BVA (15 min)
> **Quantity field** in a shopping cart: whole numbers from **1 to 99**.
1. List all equivalence partitions (valid and invalid) with one example each.
2. List the boundary values to test.
3. Add 5 error-guessing inputs.

## Exercise 4 — Decision table (15 min)
> A cinema ticket costs $12.
> - **Children (under 12)** pay 50%.
> - **Students** (with student card) pay 25% less.
> - On **Tuesdays** everyone gets an extra $2 off.
> - Child + student discounts do **not** stack; use the bigger one.

Build the decision table for conditions: *Child?*, *Student?*, *Tuesday?* (8 rules) and calculate the price for each rule.

## Exercise 5 — State transition (10 min)
> An online order can be: **Pending → Paid → Shipped → Delivered**.
> It can be **Cancelled** only from Pending or Paid.

1. Draw the state diagram.
2. Write 3 valid-transition tests.
3. Write 3 **invalid**-transition tests (e.g. cancel a Delivered order).

## Exercise 6 — Write test cases (20 min)
Use `../05-Test-Cases-and-Bug-Reports/test-case-template.md`.

> **Signup form:** Email (required, valid format), Password (8–20 chars, ≥1 digit), Confirm password (must match), "I agree to terms" checkbox (required). On success → redirect to `/welcome`.

Write **at least 8 test cases**: 2 positive, 6+ negative/boundary.

## Exercise 7 — Fix these bad bug reports (10 min)
Rewrite each so a developer can reproduce it:
1. **Title:** "Search doesn't work"
   **Description:** "I searched and nothing happened. Please fix ASAP!!!"
2. **Title:** "Bug in profile"
   **Description:** "Sometimes when I change stuff the picture is wrong. Also the date format is weird and the save button is ugly."

(Hint for #2: how many bugs is that really?)

## Exercise 8 — Find real bugs (30 min)
Explore one of these practice sites for 30 minutes using error-guessing ideas from lesson 4:
- https://automationexercise.com
- https://www.saucedemo.com (try user `problem_user`, password `secret_sauce`)
- https://the-internet.herokuapp.com

Write **2 bug reports** using `bug-report-template.md`.

## Exercise 9 — Severity & priority (5 min)
Give severity + priority for each and explain why:
1. Payment page crashes for all Visa cards.
2. Logo is 2px off on the About page.
3. Password reset email is sent, but the link has expired when clicked.
4. Company CEO's name is misspelled on the homepage.
5. Exporting a report with 1 million rows times out (only 1 customer does this, once a year).
