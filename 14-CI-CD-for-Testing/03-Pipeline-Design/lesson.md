# Lesson 3 — Designing a Test Pipeline

📂 Code: `workflows/03-full-pipeline.yml`, `local-pipeline/run-pipeline.mjs`

## Stage your pipeline by cost
```
Stage 1  (seconds)   lint · typecheck · unit tests · secret scan
   │ all pass
Stage 2  (minutes)   integration · contract · component · a11y
   │
Stage 3  (longer)    build · deploy to staging · E2E · visual
   │
Stage 4  (gate)      can-i-deploy · manual approval → deploy → smoke tests
   │
Nightly              full cross-browser · performance · security · flaky hunt
```
Principle: **fail fast on cheap signals**. Never spend 20 minutes of browser tests to discover a lint error.

Our local pipeline shows the effect: stage 1+2 finish in ~11s; the browser stage adds ~22s more.
In a real project that ratio is more like 1 minute vs 40 minutes.

## Map the test pyramid to the pipeline
| Folder | Tests | Where in the pipeline |
|--------|-------|----------------------|
| 03 Unit | Fast, isolated | Every push, stage 1 |
| 04 Integration | DB/API | Every push, stage 2 (with service containers) |
| 10 Contract | Consumer/provider | Every push, stage 2 + publish to broker |
| 01 API | HTTP | Stage 2 (against a deployed service or in-process) |
| 08 Accessibility | axe | Stage 2 |
| 02 E2E / 09 Visual | Browser | Stage 3, on staging |
| 06 Security | ZAP/audit | Stage 1 (dependency/secret scan) + nightly (DAST) |
| 05 Performance | k6 | Nightly / pre-release |
| 07 Mobile | Device farm | Nightly / pre-release |

## Making the pipeline fast
| Technique | Effect |
|-----------|--------|
| **Parallel jobs** | Independent suites run at once |
| **Sharding** (`--shard=1/4`) | One suite split across machines |
| **Caching** (npm, browsers, Docker layers) | Saves minutes per run |
| **Run only affected tests** | `nx affected`, `turbo`, `jest --changedSince` |
| **Fail fast between stages** | Don't run slow tests after a cheap failure |
| **`fail-fast: false` within a matrix** | You still learn about all browsers in one run |
| **Skip unrelated changes** | `paths:` / `paths-ignore:` filters (e.g. docs-only PRs) |
| **Bigger runners / self-hosted** | Money for time |

## Environments and test data
- **Ephemeral environments** (review apps): every PR gets its own deployment + database. Best isolation.
- **Shared staging**: cheaper, but tests must use unique data (folder 09) and tolerate other traffic.
- Each environment needs: seeded reference data, test accounts in secrets, and a reset mechanism.
- Never run automated tests against production, except **read-only smoke tests** with a dedicated account.

## Deployment safety nets that testers own
| Practice | What it means for testing |
|----------|---------------------------|
| **Smoke tests after deploy** | 3–10 critical checks against the real environment; roll back if they fail |
| **Blue/green & canary** | Release to 5% of users, watch error rates, then ramp up |
| **Feature flags** | Deploy code dark, enable for testers first — decouples deploy from release |
| **Automatic rollback** | `if: failure()` → run the rollback script |
| **Synthetic monitoring** | The same Playwright tests running every 5 minutes against production |
| **Observability** | Errors, latency and business metrics as a post-release test signal |

## Quality gates worth having
```yaml
- run: npx vitest run --coverage.thresholds.lines=80    # coverage floor
- run: npm audit --audit-level=high                     # no known high CVEs
- run: npx playwright test --grep @smoke                # smoke must pass
- run: npx pact-broker can-i-deploy ...                 # contracts verified
```
Gates must be **meaningful and stable**. A gate that everyone routinely bypasses is worse than none.

## Anti-patterns
- ❌ A 2-hour pipeline nobody waits for
- ❌ Tests that only run nightly (bugs found 12 hours late, by nobody in particular)
- ❌ Ignoring a red main branch
- ❌ `continue-on-error: true` on the tests themselves ("green" pipeline, broken product)
- ❌ Secrets in YAML
- ❌ No artifacts → undebuggable failures
- ❌ Environment-specific tests that only pass locally

## Try it
1. Run `node run-pipeline.mjs --list`, then `--all`. Compare stage timings.
2. Break a unit test and re-run: notice the browser stage never starts (fail fast).
3. Redesign the stages for a team that deploys 20 times a day. What moves to nightly?
4. Write the pipeline plan (as a table) for your own project: trigger → tests → gate.
