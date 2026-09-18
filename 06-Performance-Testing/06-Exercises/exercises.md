# Performance Testing — Exercises

All exercises use the **local** target app (`npm run server`), never public websites.

## Level 1 — Concepts
1. Calculate the average, p50, p90 and p99 by hand for: `12, 15, 14, 13, 250, 16, 14, 15, 13, 900` ms. Which number would you put in a report and why?
2. For an online ticket shop launching Taylor Swift tickets at 10:00, which test types would you run and why? Describe the load shape of each.
3. Explain the difference between 100 VUs and 100 requests/second.

## Level 2 — Run & read
4. Run `npm run load:journey` with `VUS=5`, `VUS=50` and `VUS=150` (`$env:VUS="50"`). Make a table of throughput and p95 for each. Where does it stop scaling?
5. Run `k6 run k6-scripts/01-smoke.js`, then point it at `/api/slow`. Which thresholds fail?
6. Run `k6 run k6-scripts/03-stress.js`. Record the VU level where p95 first exceeds 200ms and where errors start.

## Level 3 — Write scripts
7. Write `07-search.js`: 20 VUs for 1 min hitting `/api/products?page=N` with a random page 1–5, a check that the response is an array, and a threshold of p95 < 100ms.
8. Write a script where the login password comes from a `SharedArray` of 50 users, 10% of whom have the wrong password. Add a check and a **custom Rate metric** `login_success`. The threshold should expect about 90%.
9. Add a `setup()` that logs in once and passes the token to all VUs through `data`.
10. Convert `02-load.js` to the **open model** (`ramping-arrival-rate`).

## Level 4 — Find bottlenecks
11. Prove with a test that `/api/cpu` slows down **other** endpoints. Run two scenarios together: one hitting `/api/products` and one hitting `/api/cpu`. Compare `/api/products` p95 with and without the CPU scenario.
12. Find the `loadPenalty` threshold (50 active requests) experimentally, without reading the code.
13. Run a 10-minute soak and watch the server process memory. Explain what's growing, and propose a fix.

## Level 5 — Real-world skills
14. Fix one bottleneck in `server.js` (e.g. add a TTL to sessions, or cache `/api/products`). Run the **same** test before and after and write a comparison.
15. Write a full performance test report (structure in lesson 4) for your stress test.
16. Run Lighthouse on 3 sites you use daily. Compare their Core Web Vitals.
17. Add a GitHub Actions job that starts the server and runs `01-smoke.js` with thresholds (see `14-CI-CD-for-Testing`).

## Quiz
1. Why do averages hide performance problems?
2. Which test type finds memory leaks?
3. What does it mean when throughput plateaus while latency keeps rising?
4. `check()` failed 20% of the time but the test still passed. Why?
5. Why is the closed (VU) model sometimes misleading?
6. Name the 3 Core Web Vitals and what each measures.
7. Why must you never load test a website you don't own?

<details><summary>Answers</summary>

1. A few very slow requests get averaged away; percentiles show what real users at the tail experience.
2. Soak (endurance) test.
3. Saturation: a resource is maxed out and requests are queuing. This is the capacity limit.
4. Checks don't fail a test by themselves; add a threshold like `checks: ['rate>0.99']`.
5. When the server slows down, VUs wait, so less load is sent and the problem is partly hidden.
6. LCP (loading), INP (responsiveness), CLS (visual stability).
7. It can take the site down and is legally treated like a denial-of-service attack. You need written permission.

</details>
