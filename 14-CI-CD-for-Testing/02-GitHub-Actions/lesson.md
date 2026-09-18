# Lesson 2 — GitHub Actions for Testers

📂 Code: `workflows/*.yml`

## Structure
```yaml
name: Tests                  # shown in the Actions tab
on:                          # TRIGGERS
  push: { branches: [main] }
  pull_request:
  schedule: [{ cron: '0 2 * * *' }]
  workflow_dispatch:         # manual "Run workflow" button

jobs:
  test:                      # JOB (runs on its own machine)
    runs-on: ubuntu-latest   # or windows-latest, macos-latest, self-hosted
    timeout-minutes: 15      # ⭐ always set one, or a hung test burns an hour
    steps:                   # STEPS run in order on the same machine
      - uses: actions/checkout@v4          # reusable action from the marketplace
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci                        # shell command
      - run: npm test
```
Workflows live in `.github/workflows/*.yml` in the repository root.

## Jobs run in parallel by default
```yaml
jobs:
  unit: { ... }
  lint: { ... }
  e2e:
    needs: [unit, lint]      # ← creates a stage: only starts when both pass
```
Our `local-pipeline/run-pipeline.mjs` models exactly this: parallel inside a stage, sequential between stages.

## Matrix: run the same job many ways
```yaml
strategy:
  fail-fast: false           # let all combinations finish, even if one fails
  matrix:
    node: [20, 22]
    browser: [chromium, firefox, webkit]
# → 6 parallel jobs; use ${{ matrix.browser }} in steps
```
Sharding a big suite (`02-playwright-sharded.yml`):
```yaml
matrix: { shard: [1, 2, 3, 4] }
run: npx playwright test --shard=${{ matrix.shard }}/4
```
4 machines → roughly a quarter of the wall-clock time. Then **merge the blob reports** into one HTML report.

## Conditions
```yaml
- if: always()                                    # even when a previous step failed ⭐ for artifacts
- if: failure()                                   # only when something failed (notifications, rollback)
- if: github.ref == 'refs/heads/main'
- if: github.event_name == 'pull_request'
- continue-on-error: true                          # step can fail without failing the job
```

## Secrets and environment variables
```yaml
env:
  BASE_URL: https://staging.example.com
  TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}     # set in repo/org Settings → Secrets
```
Rules: never commit credentials; use secrets; they're masked in logs; prefer short-lived tokens/OIDC.
Beware: `pull_request` workflows from forks **don't** get secrets — by design.

## Services: real dependencies as containers
```yaml
services:
  postgres:
    image: postgres:16
    env: { POSTGRES_PASSWORD: test }
    ports: ['5432:5432']
    options: --health-cmd pg_isready --health-interval 10s --health-retries 5
```
Perfect for the integration tests from folder 04 (and closer to production than SQLite).

## Artifacts: the evidence
```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with: { name: playwright-report, path: playwright-report/, retention-days: 14 }
```
Always upload: HTML reports, traces, screenshots, videos, coverage, k6 output. Debugging a CI failure without
artifacts is guesswork — with a Playwright **trace** it takes two minutes.

## Caching
```yaml
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }          # caches ~/.npm

- uses: actions/cache@v4                           # cache Playwright browsers
  with:
    path: ~/.cache/ms-playwright
    key: pw-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

## Concurrency (save money)
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true          # a new push cancels the old run of the same branch
```

## Running Windows-specific things
Our repo is on Windows, CI is usually Linux. Watch out for: path separators, case-sensitive file names
(`LoginPage.ts` vs `loginpage.ts` — fails only on Linux!), line endings, and **screenshot baselines** (folder 12).

## Debugging a failing workflow
1. Read the failing step's log (expand it)
2. Download artifacts (report/trace/screenshots)
3. Re-run with **debug logging** (`ACTIONS_STEP_DEBUG=true` secret)
4. Re-run a single failed job
5. Reproduce locally in the same container: `docker run -it mcr.microsoft.com/playwright:v1.55.0-noble bash`
6. Or use `act` to run workflows locally

## Try it
1. Read all 5 workflow files and map each one to a folder in this repo.
2. Create a real repo, copy `01-basic-tests.yml` into `.github/workflows/`, push, and watch it run.
3. Break a test on a branch, open a PR, and see the check fail.
4. Add a matrix over `node: [20, 22]` and see 2 jobs appear.
