# Lesson 4 — Analyzing Results and Finding Bottlenecks

## The process
```
1. Define goals (SLOs)  →  2. Baseline  →  3. Run test  →  4. Monitor  →  5. Analyze  →  6. Tune  →  repeat
```
- **Baseline:** run the same test on the current version first. Without a baseline, "p95 = 180ms" means nothing.
- **Change one thing at a time**, so you know what made the difference.
- **Run tests several times.** Results vary, so look for consistent trends.

## Monitor BOTH sides
The load tool only sees the **client side**. You also need **server-side** metrics during the test:
| Layer | Watch |
|-------|-------|
| App servers | CPU, memory, GC pauses, thread/event-loop lag |
| Database | Query time, slow query log, connections in use, locks, CPU |
| Cache | Hit rate, evictions |
| Network | Bandwidth, connection count |
| Load generator | ⚠️ Its own CPU! If the k6 machine is at 100% CPU, results are invalid |

Tools: Grafana + Prometheus, Datadog, New Relic, Azure/AWS monitoring, and APM tracing to find which function or query is slow.

## Reading the graphs: common patterns
### 1. Healthy system
Throughput rises with users; latency stays flat.
```
latency  ────────────────────        throughput  ╱‾‾‾‾‾‾‾‾‾
```

### 2. Saturation (hit a limit)
Throughput **stops rising** (plateau) while latency **climbs**. Adding more users just makes a queue.
```
latency  ──────────╱╱╱╱            throughput  ╱‾‾‾‾‾‾‾‾‾ (flat, users keep increasing)
```
→ Something is maxed out: CPU, DB connection pool or thread pool. **This point is your capacity.**

### 3. Breaking point
Errors appear (timeouts, 502/503), and throughput may **drop**.
→ Check **how** it fails: gracefully (fast 503 "try later") or badly (hangs, crashes, corrupt data)?

### 4. Degradation over time (soak)
Same load, latency slowly creeping up, memory growing and never released → **memory/resource leak**.

### 5. Periodic spikes
Latency spikes every N minutes → garbage collection, cron jobs, log rotation, cache expiry.

### 6. Bimodal response times
Two clusters, e.g. 20ms and 800ms → cache hits vs misses, or one slow server behind the load balancer.

## Common bottlenecks → typical fixes
| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| DB CPU high, slow queries | Missing index, N+1 queries | Add index, eager loading |
| Latency jumps at N users exactly | Connection/thread pool size = N | Increase pool, or use async |
| All endpoints slow when one heavy endpoint is called | Blocking CPU work (Node event loop) | Worker threads, queue it, cache |
| Memory grows until crash | Leak (unbounded cache/map, listeners) | Fix leak, add bounds/TTL |
| Errors from a 3rd-party API | Rate limit or slow dependency | Timeouts, circuit breaker, caching |
| High TTFB but low CPU | Waiting on I/O (DB, network) | Profile queries, parallelize |

👉 Our `target-app/server.js` has built-in problems to find: `loadPenalty` (slows down when > 50 active requests, like a pool limit), `/api/cpu` (blocks the event loop), `/api/flaky` (5% errors), and `/api/login` (slow hashing). Also, the `sessions` Map grows forever. That's a leak a soak test would reveal!

## Reporting results
A good performance test report includes:
1. **Summary:** pass/fail vs goals, in one paragraph a manager can read
2. **Test setup:** environment, version/build, data volume, load profile (graph), duration
3. **Results table:** per transaction: count, p50/p95/p99, error %, throughput
4. **Graphs:** users vs latency vs throughput vs errors over time
5. **Server metrics:** CPU/memory/DB during the test
6. **Findings:** bottlenecks found, with evidence
7. **Recommendations** and next steps
8. **Comparison** with the baseline/previous run

## Performance testing in CI
- Run a **short smoke/load test** on every merge or nightly
- Use **thresholds** so the pipeline fails on regressions
- Store results over time to spot trends (k6 → InfluxDB/Prometheus → Grafana)
- Full stress/soak tests: before releases, in a dedicated environment

## Common mistakes
- ❌ Testing from a laptop over Wi-Fi against production
- ❌ A tiny test DB with 100 rows (production has 10 million)
- ❌ Every VU uses the same user/product → everything is cached
- ❌ No think time → unrealistic load
- ❌ Only reporting averages
- ❌ The load generator itself is the bottleneck
- ❌ Ignoring errors because "latency looks great" (fast errors are still errors!)

## Try it
1. Run `03-stress.js` with the server's `console.log` of `activeRequests` added. At what VU count does `loadPenalty` kick in? Can you see it in p95?
2. Run a 5-minute soak test while watching the server's memory in Task Manager. Does memory grow? Why? (`sessions` Map)
3. Write a 1-page report of your stress test using the structure above.
