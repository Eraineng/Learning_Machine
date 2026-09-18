# CI/CD for Testing — Learning Roadmap

Tests only protect you if they run **automatically, on every change**. This folder is about turning the
previous 11 folders into a pipeline.

```
14-CI-CD-for-Testing/
├── workflows/                  GitHub Actions examples (copy to .github/workflows/)
│   ├── 01-basic-tests.yml           run tests on every push/PR
│   ├── 02-playwright-sharded.yml    E2E split across 4 machines + merged report
│   ├── 03-full-pipeline.yml         complete staged pipeline with a deploy gate
│   ├── 04-scheduled-and-quality.yml nightly performance, security, flaky hunt
│   └── 05-pr-comment-and-gates.yml  reporting results and enforcing gates on PRs
└── local-pipeline/
    └── run-pipeline.mjs        ✅ RUNNABLE: runs every project in this repo as a staged pipeline
```

## Try it right now
```powershell
cd local-pipeline
node run-pipeline.mjs --list     # show the plan
node run-pipeline.mjs            # fast stages (unit, integration, contract, security)
node run-pipeline.mjs --all      # plus the browser stages (API, a11y, visual, E2E)
```
It demonstrates the same mechanics as CI: ordered **stages**, **parallel jobs** inside a stage,
**fail fast**, timing, and a summary report.

```
▶ 1 · Fast feedback      ✅ unit 2.4s   ✅ test data 2.5s
▶ 2 · Service level      ✅ integration 4.0s  ✅ contract 2.8s  ✅ security 6.2s
▶ 3 · Browser (slow)     ✅ api 10.8s  ✅ a11y 8.5s  ✅ visual 6.5s  ✅ e2e 24.8s
PIPELINE ✅ PASSED   9 passed · 0 failed · 33.6s total
```

## Checklist
- [ ] `01-CI-CD-Fundamentals/lesson.md`: CI, CD, the feedback loop, shift left
- [ ] `02-GitHub-Actions/lesson.md`: workflows, jobs, steps, matrix, secrets, artifacts
- [ ] `03-Pipeline-Design/lesson.md`: stages, speed, parallelism, sharding, environments
- [ ] `04-Reporting-and-Flaky-Tests/lesson.md`: reports, gates, notifications, flakiness policy
- [ ] `05-Exercises/exercises.md`
