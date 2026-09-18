# Lesson 4 — Automation Strategy

## Automation is not a goal
The goal is **fast, trustworthy feedback**. Automation is one way to get it. "Automate everything" and
"100% automation" are red flags — they produce huge, slow, flaky suites nobody trusts.

## What to automate (in priority order)
| Priority | Characteristics | Example |
|----------|-----------------|---------|
| ⭐⭐⭐ | Runs often, stable, business-critical | Login, checkout, core API contracts |
| ⭐⭐⭐ | Data-heavy and repetitive | 50 validation combinations, tax calculations |
| ⭐⭐ | Hard/slow for humans | Performance, 10k records, cross-browser |
| ⭐⭐ | Regression-prone areas | Modules with a history of bugs |
| ⭐ | Setup for manual testing | Creating test data, seeding users |

## What NOT to automate
| Don't automate | Why |
|----------------|-----|
| One-off tests | The cost never pays back |
| UI that changes weekly | Maintenance > value |
| Usability, look & feel, "does this make sense?" | Needs human judgement |
| Exploratory testing | It's a thinking activity by definition |
| Tests needing complex physical setup | Printers, card readers, cameras |
| Rarely used, low-risk features | Weak ROI |
| Unstable, half-built features | Automate after it stabilizes |

## ROI: make the argument with numbers
```
Manual cost   = executions × time per run × hourly rate
Automation    = build cost + (executions × run cost) + maintenance
Break-even    = build cost / (manual run cost − automated run cost)
```
Example: a 30-minute manual regression case, run 2×/sprint (26×/year), costs ~13 hours/year.
Automating it takes 4 hours + ~2 hours/year maintenance → pays back in the first year, then keeps giving.

⚠️ Maintenance is real: budget **10–30% of build effort per year**. Automation you don't maintain
becomes noise, and then gets deleted.

Also value the things ROI math misses: faster feedback, running 200 cases in parallel overnight,
consistency, and freeing testers for exploratory work.

## Choosing the level: push tests DOWN the pyramid
Same rule, phrased as a question: **what's the cheapest level that can catch this bug?**
| Check | Best level |
|-------|-----------|
| Tax calculation for 40 input combinations | Unit (folder 08) |
| "Missing email returns 400" | API (folder 01) |
| Order is saved with the right status | Integration (folder 04) |
| Field renamed in a downstream service | Contract (folder 10) |
| "User can complete checkout" | E2E — a handful (folder 07) |
| Button looks right in dark mode | Visual (folder 12) |

A suite with 300 UI tests and 40 unit tests is upside-down: slow, flaky and expensive. Rebalance it.

## Framework decisions
| Decision | Options | Notes |
|----------|---------|-------|
| Tool | Playwright / Cypress / Selenium / WebdriverIO | Playwright for new web projects today |
| Language | Same as the product's, usually | Developers can then help maintain it |
| Structure | Page Objects, fixtures, helpers | folder 07 lesson 4 |
| Data | Factories, fixtures, API setup | folder 09 |
| Reporting | HTML, JUnit, Allure | folder 14 |
| CI | Where and when each suite runs | folder 14 lesson 3 |
| Standards | Naming, no `sleep`, no `test.only`, review rules | Write them down |

## Quality standards for test code
Test code is **production code**. It deserves reviews, refactoring and a style guide:
- No hardcoded waits, no `test.only`, no commented-out tests
- Each test independent and repeatable
- Names describing behavior
- No duplicated locators or logic (page objects/fixtures)
- Tests fail with a message that explains the problem
- No credentials in the repo

## Measuring an automation suite's health
| Metric | Target |
|--------|--------|
| Suite duration | Fits your feedback goal (PR < 10 min) |
| Pass rate on main | > 98% |
| Flake rate | < 1% |
| Escaped defects the suite should have caught | Trending down |
| Maintenance hours per sprint | Stable, not growing |
| Coverage of high-risk areas (from lesson 2) | 100% |

Not a good metric: "number of automated test cases".

## A 6-month automation roadmap (example)
1. **Month 1:** framework setup, CI wiring, 5 smoke tests running on every PR
2. **Month 2:** API tests for the top 10 endpoints; test data factories
3. **Month 3:** E2E for the 5 business-critical journeys; reporting to Slack
4. **Month 4:** push validation cases down to unit/API level; delete redundant UI tests
5. **Month 5:** accessibility + visual tests for the design system; nightly cross-browser
6. **Month 6:** performance baseline in CI; flaky-test policy; measure and report suite health

## Try it
1. Take 20 test cases from a feature you know and classify each: automate (which level?) or manual — with a reason.
2. Calculate the ROI of automating your 3 slowest manual checks.
3. Audit the suites in this repo: which folder has the most tests, and is the pyramid the right shape?
4. Write a one-page automation strategy for a team that currently has zero automation.
