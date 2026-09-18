# CI/CD for Testing — Exercises

## Level 1 — The local pipeline
1. Run `node run-pipeline.mjs --list`, then without flags, then with `--all`. Write down the timings.
2. Break one unit test. Re-run. Explain exactly what the fail-fast logic did.
3. Add a new stage `0 · Static checks` that runs `npx tsc --noEmit` in two projects.
4. Add a `--only <stage>` flag so you can run a single stage.

## Level 2 — Real CI
5. Turn this folder into a git repository (`git init`), push it to GitHub, and add `01-basic-tests.yml` to `.github/workflows/`.
6. Make the workflow run the unit tests of folder 08. Watch it go green.
7. Open a PR with a failing test. Confirm the check blocks the merge (enable branch protection).
8. Add the coverage artifact and download it from the run.

## Level 3 — Scaling
9. Adapt `02-playwright-sharded.yml` to folder 07's project and run it with 2 shards.
10. Add a matrix over `browser: [chromium, firefox, webkit]` (remember `npx playwright install`).
11. Add npm + browser caching. Measure the run time before and after.
12. Add `concurrency` so a new push cancels the previous run.

## Level 4 — Gates and reporting
13. Add a coverage gate at 80% to the unit test job and make it fail on purpose.
14. Publish JUnit results with `dorny/test-reporter` and view the failures inline on a PR.
15. Add a job that runs the security tests (folder 05) and `npm audit --audit-level=high`.
16. Add a nightly workflow that runs the k6 smoke test against the local target app.

## Level 5 — Real-world scenarios
17. Design (on paper) a pipeline for a team of 10 deploying 5×/day, with: 4,000 unit tests, 300 API tests, 80 E2E tests, a 20-minute performance suite. Which stage does each go in? What's your PR feedback time target?
18. Write a **flakiness policy** for that team.
19. Write the **notification matrix**: what fails → who gets told → how.
20. Add a "deploy + smoke test + rollback on failure" job to `03-full-pipeline.yml` for a fake deploy script.

## Quiz
1. `npm ci` vs `npm install` in CI?
2. What does `needs:` do, and how does it create stages?
3. Why `if: always()` on artifact upload steps?
4. What does `--shard=2/4` do?
5. Name 4 causes of flaky tests and their fixes.
6. Why can retries be dangerous?
7. What should run nightly instead of on every PR, and why?
8. Which tests should run **after** deploying to production?

<details><summary>Answers</summary>

1. `npm ci` installs exactly the lock file, deletes `node_modules` first, and is reproducible; `npm install` can silently update versions.
2. It makes a job wait for other jobs to succeed, creating sequential stages out of parallel jobs.
3. Because the artifacts (reports, traces, screenshots) are most needed exactly when the tests failed.
4. Runs the second quarter of the test suite, so 4 machines can split the work.
5. Fixed sleeps → web-first assertions; shared data → unique data per test; real time/randomness → freeze/seed; network calls → mock at boundaries (also animations, order dependencies, underpowered runners).
6. They hide real intermittent bugs and make a broken suite look green.
7. Slow or noisy suites: full cross-browser E2E, performance, DAST security scans, flaky hunts — they'd make PR feedback too slow.
8. Smoke tests (a handful of critical read-only journeys), plus ongoing synthetic monitoring.

</details>
