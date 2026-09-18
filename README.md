# Learning Machine — Software Testing

A complete, hands-on curriculum, **ordered by what to learn first**. Every folder has lessons (from scratch),
exercises, and — where the topic allows — a working project you can run.
All example code in this repo has been executed and passes.

## 🔴 Start here — biggest gaps, highest payoff
| # | Topic | What's inside | Runnable |
|---|-------|---------------|----------|
| [00](00-Testing-Fundamentals/) | **Testing Fundamentals** | Principles, test levels, types, test design, bug reports, glossary, quiz | — |
| [01](01-API-Testing/) | **API Testing & Postman** ⭐ | HTTP, manual testing, Playwright API tests, **Postman + newman** | ✅ 13 tests + 24 assertions |
| [02](02-SQL-for-QA/) | **SQL for QA** ⭐ | JOINs, orphan records, dirty writes, data audit | ✅ 26 tests + audit tool |
| [03](03-Interview-Prep/) | **Interview Prep** 🎯 | Test plan/IEEE 829, pentest, integration, negative NFT, drills, **flight-booking lab** | ✅ 30 tests |

## 🟠 Then — core test levels
| # | Topic | What's inside | Runnable |
|---|-------|---------------|----------|
| [04](04-Integration-Testing/) | **Integration Testing** | Express + real SQLite + a fake external service | ✅ 23 tests |
| [05](05-Security-Testing/) | **Security Testing** | OWASP Top 10 on a vulnerable app vs its secure twin | ✅ 41 tests |
| [06](06-Performance-Testing/) | **Performance Testing** | Metrics, k6 scripts, a load tester built from scratch | ✅ local app + 2 tools |
| [07](07-Playwright-UI-Automation/) | **Playwright UI Automation** | Locators, actions, page objects, fixtures, debugging, mocking | ✅ 36 tests |
| [08](08-Unit-Testing/) | **Unit Testing** | Vitest, matchers, mocks/spies/timers, TDD, coverage | ✅ 46 tests |
| [09](09-Test-Data-Management/) | **Test Data Management** | Factories, isolation, data-driven tests, anonymization | ✅ 42 tests |

## 🟡 Specializations
| # | Topic | What's inside | Runnable |
|---|-------|---------------|----------|
| [10](10-Contract-Testing/) | **Contract Testing** | Consumer-driven contracts, provider verification, Pact | ✅ 9 tests |
| [11](11-Accessibility-Testing/) | **Accessibility Testing** | WCAG, axe scanning, keyboard & screen reader testing | ✅ 15 tests |
| [12](12-Visual-Regression-Testing/) | **Visual Regression** | Baselines, flaky screenshots, pixel diffing | ✅ 13 tests |
| [13](13-Mobile-Testing/) | **Mobile Testing** | Device emulation, mobile conditions, Appium reference | ✅ 32 tests |

## 🟢 Craft & process
| # | Topic | What's inside | Runnable |
|---|-------|---------------|----------|
| [14](14-CI-CD-for-Testing/) | **CI/CD for Testing** | GitHub Actions workflows + a local pipeline runner | ✅ pipeline |
| [15](15-Test-Design-and-Strategy/) | **Test Design & Strategy** | Pairwise, risk-based testing, strategy/plan templates | ✅ generator |
| [16](16-Bug-Reporting-and-Test-Management/) | **Bug Reporting & Management** | Reports, triage, RCA, metrics, release readiness | ✅ metrics tool |

Track your progress in each folder's own `README.md` checklist.

## Run everything at once
```bash
node "14-CI-CD-for-Testing/local-pipeline/run-pipeline.mjs" --all
```
```
▶ 1 · Fast feedback   ✅ unit · ✅ test data
▶ 2 · Service level   ✅ integration · ✅ contract · ✅ security · ✅ sql · ✅ flight-lab · ✅ postman
▶ 3 · Browser         ✅ api · ✅ a11y · ✅ visual · ✅ e2e
PIPELINE ✅ PASSED   12 passed · 0 failed
```
(Each project needs `npm install` in its own folder first.)

## Requirements
- **Node.js 22+** (folders 02, 04, 05, 09 use the built-in `node:sqlite`)
- **VS Code** + extensions: Playwright Test, Vitest, REST Client
- Browsers for Playwright: `npx playwright install chromium webkit`
- Optional: k6 (folder 06), Android Studio (folder 13), Docker (several advanced exercises)

## How the folders connect
```
00 Fundamentals ─── the thinking behind everything below
   │
   ├─ 08 Unit ─────────┐
   ├─ 04 Integration ──┤          the test pyramid
   ├─ 01 API ──────────┤
   ├─ 10 Contract ─────┤
   └─ 07 UI/E2E ───────┘
        │
        ├─ 11 Accessibility · 12 Visual · 13 Mobile   (specialized checks on the same UI)
        ├─ 05 Security · 06 Performance               (non-functional)
        ├─ 02 SQL · 09 Test Data                      (verifying and feeding every level)
        ├─ 14 CI/CD                                   (runs all of it, automatically)
        ├─ 15 Strategy · 16 Reporting                 (deciding what to test, telling the story)
        └─ 03 Interview Prep                          (rehearsing all of the above out loud)
```
