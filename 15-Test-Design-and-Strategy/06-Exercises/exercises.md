# Test Design & Strategy — Exercises

## Level 1 — Advanced design techniques
1. Run `node tools/pairwise.mjs`. Then write `my-params.json` for a flight booking form (trip type, class, passengers, payment, country) and generate a pairwise set. How big is the reduction?
2. Add a constraint by hand: Safari never runs on Android. Remove invalid rows and note how many are left.
3. Draw the state machine for a support ticket (`new → assigned → in progress → resolved → closed`, with `reopened`). List all valid transitions, then all **invalid** ones. Write 5 invalid-transition test cases.
4. Build a decision table for shipping cost: (member? yes/no) × (order ≥ €50?) × (country: domestic/EU/rest) × (express?). How many rules? Collapse the ones with identical outcomes.

## Level 2 — Risk-based testing
5. Build a risk matrix (use the template) for a release containing: a new payment provider, a refactored search, a new admin dashboard, and an updated privacy policy page.
6. You have 3 days instead of 10. Using your matrix, decide exactly what you will test and what you will drop. Write the residual risk statement.
7. Take the defect history idea from folder 00 (defect clustering): which areas of *this repo* would you consider risky and why?

## Level 3 — Strategy and planning
8. Fill in `test-strategy-template.md` for a fictional e-commerce company with 4 teams.
9. Write a one-page test plan for adding "Sign in with Google" to that product.
10. Define measurable entry and exit criteria for it. Would a manager be able to verify them without asking you?
11. Estimate the testing effort two ways (ratio and per-case) and explain the difference.
12. Write a Definition of Done for a team that deploys twice a day.

## Level 4 — Automation strategy
13. Classify 20 test cases of your choice: automate at unit / API / integration / E2E level, or keep manual. Justify each.
14. Calculate the ROI for automating a 45-minute manual regression pass run twice a week.
15. Audit this repository: count the tests per folder. Is the pyramid the right shape? What would you rebalance?
16. Write a 6-month automation roadmap for a team with zero automation and a 3-day manual regression cycle.

## Level 5 — Put it together
17. Produce a complete test approach for **one** of the projects in this repo (pick folder 04, 05 or 10): strategy excerpt, risk matrix, test plan, traceability matrix. This is portfolio-quality work — keep it.
18. Present it (5 slides or 1 page) as if to a product manager who wants to cut testing time in half.

## Quiz
1. What does pairwise testing assume about defects?
2. Risk = ? × ?
3. Strategy vs plan — which changes per release?
4. Give 3 measurable exit criteria.
5. Name 4 things you should never automate.
6. What's the cheapest level that can catch "tax is wrong for 40 input combinations"?
7. Why is "number of automated test cases" a bad metric?
8. What's the most professional thing to include in a risk matrix?

<details><summary>Answers</summary>

1. That most defects are caused by a single parameter or an interaction between two — so covering all pairs finds most of them.
2. Likelihood × Impact.
3. The test plan; the strategy is long-lived.
4. E.g. "100% of high-risk tests executed", "0 open critical defects", "automated regression green on main", "p95 latency < 300ms".
5. One-off tests, rapidly changing UI, usability/look-and-feel, exploratory testing, rarely used low-risk features, unstable features.
6. Unit tests.
7. It rewards quantity over value; 500 slow, flaky, redundant tests are worse than 50 good ones.
8. What you are deliberately **not** testing, and why — signed off by someone.

</details>
