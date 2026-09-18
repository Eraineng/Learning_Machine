# Lesson 3 — Test Types and Workload Modeling

📂 Code: `perf-project/k6-scripts/02-load.js` … `06-user-journey.js`

## Stages: shaping the load
```js
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up from 0 to 50 VUs
    { duration: '1m',  target: 50 },   // hold
    { duration: '15s', target: 0 },    // ramp down
  ],
};
```
**Always ramp up.** Starting 1,000 users at once tests your connection handling, not normal behavior.

| Script | Pattern | Look for |
|--------|---------|----------|
| `02-load.js` | ramp → hold at expected users | Goals met? Stable latency during hold? |
| `03-stress.js` | 50 → 100 → 200 → 400 | At what level do p95 and errors jump? Does it **recover** after? |
| `04-spike.js` | 10 → 300 in 5s → 10 | Errors during the spike? Recovery time? |
| `05-soak.js` | 30 VUs for a long time | Latency creeping up over time? Memory growing? |

## Workload modeling: making tests realistic
A load test is only as good as its model of real traffic. Get data from **production analytics/logs**:
- Peak requests per second, and at what time of day
- Which pages/endpoints, in what **ratio** (e.g. 70% browse, 20% search, 10% checkout)
- Session length and think time
- Data variety (different users, products, search terms)

### Closed vs open model
| | Closed model (VUs) | Open model (arrival rate) |
|--|--------------------|---------------------------|
| Defined by | Number of concurrent users | New requests/iterations per second |
| When the server slows down | Load **drops** automatically (users wait) | Load **stays the same**, so requests pile up |
| Realistic for | Internal apps, fixed user base | Public websites: new visitors keep arriving |
| k6 executor | `ramping-vus`, `constant-vus` | `constant-arrival-rate`, `ramping-arrival-rate` |

⚠️ The closed model can **hide problems**: a slow server gets less traffic, so it looks okay.

## Scenarios: multiple user types at once
```js
export const options = {
  scenarios: {
    browsers: { executor: 'ramping-vus', exec: 'browse', stages: [...] },
    buyers:   { executor: 'constant-arrival-rate', exec: 'buy',
                rate: 5, timeUnit: '1s', duration: '1m', preAllocatedVUs: 20 },
  },
};
export function browse() { ... }
export function buy() { ... }
```

## Test data
```js
import { SharedArray } from 'k6/data';
const users = new SharedArray('users', () => JSON.parse(open('./users.json')));
// pick per VU/iteration:
const user = users[(__VU - 1) % users.length];   // __VU = VU number, __ITER = iteration number
```
Why it matters: 1,000 VUs all logging in as the **same user** or requesting the **same product** hit caches and give unrealistically good results.

## Correlation (dynamic values)
Real flows pass values from one response into the next request:
```js
const token = http.post(`${BASE}/api/login`, ...).json('token');
http.post(`${BASE}/api/cart`, null, { headers: { Authorization: `Bearer ${token}` } });
```
Also: CSRF tokens, session IDs, created order IDs.

## Groups and custom metrics
```js
group('Buy flow', () => { ... });                   // timing for the whole group
const loginTime = new Trend('login_duration', true);
loginTime.add(res.timings.duration);
thresholds: { login_duration: ['p(95)<200'] }
```
Metric types: `Counter` (sum), `Gauge` (latest value), `Rate` (% true), `Trend` (stats/percentiles).

## Other tools, briefly
| Tool | Language | Notes |
|------|----------|-------|
| **k6** | JavaScript | Modern, CLI, CI-friendly, Grafana Cloud for distributed runs |
| **JMeter** | GUI / XML (Java) | Oldest and most widely used in enterprises; many protocols; heavy |
| **Gatling** | Scala/Java/Kotlin/JS | Very efficient, great HTML reports |
| **Locust** | Python | Code-based, easy distributed mode |
| **Artillery** | YAML + JS | Node-based, good for quick tests and Playwright browser load |
| **autocannon** | Node | Quick HTTP benchmarking |

## Try it
1. Run `02-load.js` and `03-stress.js` against the local server. Find the approximate breaking point.
2. Run `06-user-journey.js`. Which threshold is closest to failing?
3. In `02-load.js`, add a third request to `/api/cpu` for 10% of iterations. What happens to **all** the other requests' latency, and why? (Hint: Node.js is single-threaded.)
4. Convert `02-load.js` to an **open model** with `ramping-arrival-rate`, from 10 to 100 iterations/s.
