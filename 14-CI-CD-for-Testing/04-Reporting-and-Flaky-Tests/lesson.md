# Lesson 4 — Reporting, Notifications and Flaky Tests

📂 Code: `workflows/05-pr-comment-and-gates.yml`, `04-scheduled-and-quality.yml`

## Reporting: results must reach humans
| Output | How |
|--------|-----|
| **Pass/fail check on the PR** | Automatic; block merge with branch protection rules |
| **Test report as a check** | `dorny/test-reporter` with JUnit XML — failures shown inline |
| **PR comment** | Coverage diff, number of failures, links to reports |
| **Artifacts** | HTML report, traces, screenshots, videos |
| **Inline annotations** | `echo "::error file=src/cart.ts,line=42::message"` |
| **Dashboards** | Allure, ReportPortal, Currents, Grafana |

Common report formats: **JUnit XML** (universal), JSON, HTML, **Allure** (rich, history, trends).
```powershell
npx playwright test --reporter=junit,html
npx vitest run --reporter=junit --outputFile=test-results/junit.xml
```

## Notifications: only when it's actionable
- Failures on **main** → team Slack channel + the person who pushed
- Failures on a PR → the PR author only (the check is enough)
- Nightly failures → a triage rotation, not @channel at 3am
- ⚠️ Alert fatigue is real: if the channel is always red, nobody looks. Fix or quarantine instead.

## ⭐ Flaky tests: the silent killer
A **flaky** test passes and fails with no code change. Effects: people re-run until green, real failures get
ignored, trust in the suite collapses.

### Causes and fixes
| Cause | Fix |
|-------|-----|
| Fixed sleeps / race conditions | Web-first assertions and explicit waits (folder 07) |
| Shared test data | Unique data per test (folder 09) |
| Test execution order dependency | Make tests independent; run shuffled to prove it |
| Real time/date/random | Freeze the clock, seed randomness (folders 08, 12) |
| Network / third-party services | Mock at the boundary (folder 04) |
| Animations | `animations: 'disabled'` |
| Under-powered CI machine | Larger runners, fewer parallel workers, longer timeouts |
| Resource leaks between tests | Close browsers/DB connections; check teardown |

### Detecting flakiness
```powershell
npx playwright test --repeat-each=10 --retries=0
npx vitest run --sequence.shuffle          # order dependencies
```
Playwright marks a test **flaky** when it fails then passes on retry — watch that count in the report.

### A flakiness policy (write one down)
1. **Retries**: `retries: 2` in CI only — they hide flakiness, so treat every retry as a defect signal
2. **Track**: record flaky tests with their failure rate (Currents, ReportPortal, or a spreadsheet)
3. **Quarantine**: move a flaky test out of the blocking suite (tag `@quarantine`) — but with a ticket and an owner
4. **Fix or delete within N days.** A quarantined test that nobody fixes is dead weight
5. **Budget**: e.g. "flake rate must stay below 1% of runs"

> Never "fix" flakiness by adding `waitForTimeout` or raising retries to 5. That converts a visible problem
> into an invisible one.

## Test metrics worth tracking
| Metric | Why |
|--------|-----|
| Pipeline duration (p50/p95) | Feedback speed |
| Pass rate on main | Stability of the product and the suite |
| Flake rate | Trust in the suite |
| Coverage trend | Direction matters more than the number |
| Escaped defects (found in production) | The real measure of test effectiveness |
| Mean time to detect / to recover | How quickly problems surface and get fixed |

⚠️ Don't turn metrics into targets people game (number of test cases, 100% coverage).

## Post-deploy: testing doesn't stop at release
- **Smoke tests** right after deploy, with automatic rollback on failure
- **Synthetic monitoring**: run key journeys against production every few minutes
- **Real user monitoring** and error tracking (Sentry) — production tells you what tests missed
- Feed every escaped bug back into the suite as a regression test

## Try it
1. Run `npx playwright test --reporter=junit --output=results.xml` in folder 07 and open the XML.
2. Add `--repeat-each=5` to the a11y or E2E project. Any flakiness?
3. Write your team's flakiness policy (retry rules, quarantine, ownership, deadline). Half a page.
4. Design the notification rules for: PR failure, main failure, nightly failure, production smoke failure.
