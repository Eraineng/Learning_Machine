# Performance Testing — Learning Roadmap

**Does the system stay fast and stable under load?**
Main tool: **k6** (free, JavaScript scripts, industry standard). Also JMeter, Gatling, Locust, Artillery.

⚠️ **Golden rule:** only load test systems you own or have **written permission** to test.
A load test against someone else's site is indistinguishable from a denial-of-service attack.
That's why this folder includes its own local target app.

```
perf-project/
├── target-app/server.js         ← local app to test (safe!)
├── node-load/
│   ├── mini-load-tester.js      ← a load tester from scratch: see how the tools work inside
│   └── autocannon-test.js       ← quick benchmark with thresholds
└── k6-scripts/
    ├── 01-smoke.js    02-load.js    03-stress.js
    ├── 04-spike.js    05-soak.js    06-user-journey.js
```

## Setup
```powershell
cd perf-project
npm install
npm run server                 # terminal 1: start the target app on :3333
npm run load:journey           # terminal 2: mini load tester (20 VUs, 10s)
npm run load:autocannon        # terminal 2: autocannon benchmark
```

### Install k6 (needed for k6-scripts)
```powershell
winget install k6 --source winget
# or: choco install k6   ·   or download from https://grafana.com/docs/k6/latest/set-up/install-k6/
k6 run k6-scripts/01-smoke.js
```

## Checklist
- [ ] `01-Performance-Concepts/lesson.md`: metrics, percentiles, types of tests
- [ ] `02-k6-Basics/lesson.md`: VUs, checks, thresholds, first script
- [ ] `03-Test-Types-and-Scenarios/lesson.md`: smoke/load/stress/spike/soak, workload models
- [ ] `04-Analyzing-Results/lesson.md`: reading results, bottlenecks, reporting
- [ ] `05-Frontend-Performance/lesson.md`: Core Web Vitals, Lighthouse, Playwright
- [ ] `06-Exercises/exercises.md`
