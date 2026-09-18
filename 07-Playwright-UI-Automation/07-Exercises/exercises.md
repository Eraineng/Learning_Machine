# Playwright UI Automation — Exercises

Write your tests in `playwright-project/tests/exercises/`.
Run them with `npx playwright test tests/exercises --ui`.

---

## Level 1 — Basics (saucedemo)
1. **Logout:** log in, open the menu, click Logout, and assert you're back on the login page.
2. **Product details:** click "Sauce Labs Bolt T-Shirt", assert the details page shows price `$15.99`, then click "Back to products".
3. **Remove from cart:** add 2 items, remove 1 on the inventory page, and assert the badge shows `1`.
4. **Sort A→Z / Z→A:** assert product names are sorted correctly both ways.

## Level 2 — Widgets (the-internet.herokuapp.com)
5. `/add_remove_elements/`: add 5 elements, delete 2, and assert 3 remain.
6. `/dynamic_controls`: remove the checkbox, assert "It's gone!", enable the input, and type text.
7. `/tables`: in Table 1, find the row for **Jason Doe** and assert his email is `jdoe@hotmail.com` (use `getByRole('row').filter(...)`).
8. `/entry_ad`: a modal appears; close it and assert it's hidden.
9. `/infinite_scroll`: scroll down 3 times and assert more paragraphs are loaded.
10. `/drag_and_drop`: drag A onto B and assert the headers swapped.

## Level 3 — TodoMVC (https://demo.playwright.dev/todomvc)
11. Add 3 todos and assert the count text shows "3 items left".
12. Complete one todo, then filter by **Active** and **Completed** and assert each list.
13. Double-click a todo to edit it, change the text, and press Enter.
14. "Clear completed" removes only completed items.
15. Todos survive a page reload (localStorage).

Build a **`TodoPage` page object** and use it in all of these.

## Level 4 — Framework skills
16. Create `pages/MenuPage.ts` and `pages/ProductDetailsPage.ts` and refactor Level 1 to use them.
17. Create a fixture `loggedInPage` using **storageState** from a setup project (see lesson 6).
18. Data-driven: loop over all 6 saucedemo users (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) and record which can complete a purchase.
19. Mock https://demo.playwright.dev/api-mocking to return 100 fruits, and assert all 100 are shown.
20. Tag 3 tests with `@smoke` and run only those with `--grep @smoke`.

## Level 5 — Find the bugs 🐞
Log in as **`problem_user`** on saucedemo and write tests that **expose bugs**. For example:
- Are the product images correct?
- Does sorting work?
- Can you fill in the checkout form's last name?

For each bug:
1. Write a test that **fails** because of the bug. Mark it `test.fail()` so the suite stays green and documents the known bug.
2. Write a bug report using `00-Testing-Fundamentals/05-Test-Cases-and-Bug-Reports/bug-report-template.md`.

Then try **`error_user`** and **`visual_user`**. What's broken for each?

---

## Self-review checklist
Before calling an exercise done:
- [ ] No `waitForTimeout`
- [ ] No CSS/XPath where `getByRole`/`getByTestId` would work
- [ ] Every test has at least one meaningful `expect`
- [ ] Tests pass when run alone **and** together (`--repeat-each=3`)
- [ ] Test names describe the behavior ("removing an item updates the badge")
- [ ] Repeated steps live in page objects or fixtures
