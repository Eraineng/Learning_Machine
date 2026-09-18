# Lesson 3 — Test Management Tools

## What test management covers
1. **Requirements** → what should the product do?
2. **Test cases** → how do we verify it? (organized in suites/folders)
3. **Test runs / cycles** → executing a set of cases against a build, recording results
4. **Defects** → linked to the failing test and the requirement
5. **Traceability & reporting** → coverage, progress, quality status

## The tools
| Tool | Type | Notes |
|------|------|-------|
| **Jira** | Issue tracking | The industry default for defects and stories; test management via plugins |
| **Xray** / **Zephyr** | Jira plugins | Test cases live **inside** Jira, linked to stories; good traceability |
| **TestRail** | Standalone | Clean UI, strong reporting, widely used |
| **qTest**, **PractiTest**, **TestLink** (free) | Standalone | Similar concepts |
| **Azure Test Plans** | Azure DevOps | Integrated with Azure pipelines/boards |
| **Allure TestOps**, **ReportPortal**, **Currents** | Automation-first | Aggregate automated runs, detect flaky tests, history/trends |
| **Markdown/Git** | Lightweight | Many agile teams keep cases as code/markdown next to the tests ⭐ |

Tool choice matters much less than **consistency** and **traceability**.

## Jira basics for testers
| Concept | Meaning |
|---------|---------|
| **Issue types** | Story, Bug, Task, Epic, Sub-task, Test (with plugins) |
| **Workflow** | The states a bug moves through (lesson 2) — configurable per project |
| **Fields** | Severity, priority, affects/fix version, environment, components, labels |
| **Links** | "blocks", "is caused by", "relates to", "tests" ⭐ traceability |
| **JQL** | The query language — learn it, it's your reporting superpower |

Useful JQL:
```sql
project = SHOP AND type = Bug AND status not in (Closed, Rejected) AND priority = High ORDER BY created ASC
project = SHOP AND type = Bug AND created >= -14d AND "Found In" = Production
project = SHOP AND fixVersion = "2.4.0" AND status = "Ready for Retest" AND assignee = currentUser()
project = SHOP AND type = Bug AND component = Checkout AND created >= -90d      -- clustering
```
Save them as **filters** and put them on a dashboard — that's your daily quality view.

## Organizing test cases
```
Suite: Checkout
├── Smoke (8 cases, tagged @smoke, run on every build)
├── Coupons (24 cases)
├── Payment methods (18 cases)
└── Regression (140 cases, nightly)
```
Attributes worth having on every case: **id, title, priority/risk, automated?, linked requirement, owner, last result**.

## Test runs / cycles
A **run** = executing a selected set of cases against a specific build/environment.
Record per case: Pass / Fail / Blocked / Skipped / Not run + evidence + linked defect.
Reporting then answers: how far are we? what's failing? is quality improving build over build?

## Manual and automated in one place
The modern pattern:
1. Test cases (manual + automated) live in the management tool or in code
2. CI publishes automated results (JUnit XML) into it after every run
3. The tool shows **combined** coverage and history; flaky tests are flagged automatically

```yaml
# folder 14 style: publish results after the run
- run: npx playwright test --reporter=junit --output-file=results.xml
- run: trcli -y -h $TESTRAIL_URL --project "Shop" parse_junit -f results.xml   # example: TestRail CLI
```

## Traceability in practice
```
Epic → Story (US-12) → Acceptance criteria
                     ├── Test cases TC-001..003  (2 automated)
                     ├── Automated spec: tests/login.spec.ts
                     └── Defects: BUG-231 (open)
```
This answers, in one click: *is this story tested? what's failing? can we release it?*
(Template: `15-Test-Design-and-Strategy/05-Templates/traceability-matrix-template.md`)

## Keeping it maintainable
- **Delete obsolete cases.** A suite of 2,000 cases where 600 are stale is worse than 900 current ones
- Review the suite each quarter: still relevant? still risky? automated by now?
- Prefer **fewer, better** cases with clear risk links (folder 15)
- Don't document what the automated test already documents — link to the code instead

## Try it
1. Create a free Jira/TestRail trial (or use a spreadsheet) and enter the 14 defects from `tools/sample-defects.json`.
2. Write 5 JQL queries you'd put on a release dashboard.
3. Build a traceability matrix for 3 features of any project in this repo, linking to the actual spec files.
4. Design the test case structure (suites + tags) for the Playwright project in folder 07.
