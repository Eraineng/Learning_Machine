# Lesson 2 — k6 Basics

📂 Code: `perf-project/k6-scripts/01-smoke.js`

## How load tools work
Look at `node-load/mini-load-tester.js` first. It's about 80 lines and does what k6 does:
1. Start N **virtual users** (VUs) running at the same time
2. Each VU loops a **user journey**: send requests, measure time, pause (think time)
3. Collect all timings → calculate **percentiles, throughput, error rate**
4. Compare against **thresholds** → pass/fail exit code (for CI)

k6 does this much more efficiently (written in Go; one machine can run thousands of VUs).

## Script structure
```js
import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. init code: runs once per VU (load files, define options)
export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

// 2. setup(): once before the test (e.g. create test data, get an admin token)
export function setup() { return { token: 'abc' }; }

// 3. default function: the VU code, looped again and again
export default function (data) {
  const res = http.get('http://localhost:3333/api/products');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has 10 items': (r) => r.json().length === 10,
  });
  sleep(1);
}

// 4. teardown(data): once after the test (cleanup)
export function teardown(data) {}
```
⚠️ It looks like Node.js, but k6 is **not** Node. You can't use npm packages or `fs`. It has its own modules (`k6/http`, `k6/data` …).

## Running
```powershell
k6 run script.js
k6 run --vus 20 --duration 1m script.js          # override options
k6 run -e BASE_URL=http://staging:3333 script.js # environment variables (__ENV.BASE_URL)
k6 run --out json=results.json script.js         # raw results
$env:K6_WEB_DASHBOARD="true"; k6 run script.js   # live dashboard at http://localhost:5665
```

## Checks vs Thresholds
| | `check()` | `thresholds` |
|--|-----------|--------------|
| Purpose | Verify a response is correct | Pass/fail criteria for the **whole test** |
| Fails the test? | ❌ No, just counted (`checks` rate) | ✅ Yes, non-zero exit code |
| Example | `status is 200` | `p(95)<300` |

Make checks count with a threshold: `checks: ['rate>0.99']`.

## Reading the output
```
     ✓ status is 200
     checks.........................: 100.00% ✓ 30   ✗ 0
     http_req_duration..............: avg=41ms  min=21ms med=40ms max=64ms p(90)=57ms p(95)=60ms
       { expected_response:true }...: avg=41ms ...
   ✓ http_req_failed................: 0.00%   ✓ 0    ✗ 30
     http_reqs......................: 30      1.95/s
     iteration_duration.............: avg=1.04s
     iterations.....................: 30
     vus............................: 2       min=2  max=2
```
| Metric | Meaning |
|--------|---------|
| `http_req_duration` | Total request time (send + wait + receive): **the main one** |
| `http_req_waiting` | Time to first byte (TTFB): server processing |
| `http_req_failed` | Rate of failed requests (status ≥ 400 by default) |
| `http_reqs` | Total requests and requests/second (throughput) |
| `iterations` | How many times the default function completed |
| `vus` | Active virtual users |
| `checks` | Pass rate of all checks |

`✓`/`✗` in front of a metric = threshold passed or failed.

## Useful http features
```js
http.post(url, JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
http.get(url, { headers: { Authorization: `Bearer ${token}` } });
http.get(url, { tags: { name: 'product-detail' } });     // group URLs with IDs under one name
const [a, b] = http.batch([['GET', url1], ['GET', url2]]); // parallel requests like a browser
res.json('token');                                         // extract a JSON field
res.timings.duration;
```

## Think time
Real users don't click 100 times a second. `sleep(1–5 seconds)` between steps makes load **realistic**.
- No sleep = maximum pressure (stress tests)
- Random sleep avoids synchronized "waves": `sleep(Math.random() * 3 + 1)`

## Try it
1. Start the server (`npm run server`), then run `k6 run k6-scripts/01-smoke.js`. Read every metric line.
2. Change the threshold to `p(95)<30`, re-run, and see the ✗ and exit code (`echo $LASTEXITCODE`).
3. Change the URL to `/api/flaky`. What happens to `http_req_failed` and the checks?
4. Compare: run `npm run load:journey` and read `mini-load-tester.js`. Match each part to k6 concepts.
