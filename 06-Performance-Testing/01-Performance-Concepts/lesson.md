# Lesson 1 — Performance Testing Concepts

## Why it matters
- Amazon famously found every extra 100ms of latency cost measurable sales
- 53% of mobile users leave a page that takes longer than 3s to load (Google research)
- Systems that work for 10 users can collapse at 1,000: Black Friday, ticket sales, product launches

Functional tests answer "**does it work?**". Performance tests answer "**does it work fast enough, for enough users, for long enough?**"

## Key metrics
| Metric | Meaning | Example goal |
|--------|---------|--------------|
| **Response time / latency** | Time from sending a request to receiving the full response | p95 < 300 ms |
| **Throughput** | Requests (or transactions) handled per second (RPS/TPS) | ≥ 500 RPS |
| **Error rate** | % of failed requests (5xx, timeouts, wrong content) | < 1% |
| **Concurrent users / VUs** | Users active at the same time | 1,000 |
| **Resource utilization** | Server CPU, memory, disk, network, DB connections | CPU < 70% |
| **Apdex** | User satisfaction score, 0–1, based on a target time | > 0.9 |

## ⭐ Percentiles: why averages lie
Ten requests: `50, 50, 50, 50, 50, 50, 50, 50, 50, 5000` ms
- **Average** = 545 ms → "a bit slow"
- **Median (p50)** = 50 ms → "typical user is fine"
- **p90** = 50 ms, **p99** ≈ 5000 ms → "1 in 10 users waits 5 seconds!"

| Percentile | Meaning |
|------------|---------|
| **p50** (median) | Half of requests are faster than this |
| **p90** | 90% faster, the slowest 10% are slower |
| **p95** | Most common SLA metric |
| **p99** | "Tail latency": your unhappiest users; critical at scale |
| **max** | Single worst request; often noisy |

**Always set goals and report on percentiles (p95/p99), not averages.**

## Latency breakdown (one HTTP request)
```
DNS lookup → TCP connect → TLS handshake → [send request] → waiting (TTFB) → receive body
                                                          └─ server processing time
```
k6 reports each phase: `http_req_connecting`, `http_req_tls_handshaking`, `http_req_waiting`, etc.

## Types of performance tests
```
Users
  ▲
  │                     STRESS: keep climbing until it breaks
  │                   ╱
  │          SPIKE  ╱
  │           ┃┃  ╱
  │   LOAD ───┃┃─╱────────        SOAK: normal load for hours ──────────────────
  │  ╱        ┃┃
  │ ╱ SMOKE ─ ─ ─
  └──────────────────────────────────────────────────────────────► Time
```
| Type | Load | Duration | Question |
|------|------|----------|----------|
| **Smoke** | Tiny (1–5 VUs) | 1 min | Does the script and system work at all? |
| **Load** | Expected normal/peak traffic | 5–60 min | Do we meet our goals under expected traffic? |
| **Stress** | Above normal, increasing | 10–60 min | Where's the breaking point? How does it fail? |
| **Spike** | Sudden jump | Short | Can it survive a sudden surge, and recover? |
| **Soak / Endurance** | Normal | Hours | Memory leaks? Slow degradation? |
| **Breakpoint / Capacity** | Ramp until failure | Varies | Maximum capacity for planning |
| **Scalability** | Increase load + resources | Varies | Does adding servers add capacity linearly? |

## SLI, SLO, SLA
- **SLI** (indicator): what you measure → "p95 latency of /checkout"
- **SLO** (objective): your internal target → "p95 < 400 ms over 30 days"
- **SLA** (agreement): a contract with customers, with penalties → "99.9% availability"

Performance tests verify you can meet the SLOs **before** production.

## Where do bottlenecks usually hide?
1. **Database:** missing indexes, N+1 queries, locks, connection pool exhausted
2. **Application code:** CPU-heavy work, synchronous blocking (Node's single thread!), inefficient loops
3. **Memory:** leaks, garbage collection pauses
4. **External calls:** slow third-party APIs without timeouts
5. **Infrastructure:** too few instances, load balancer limits, network, disk I/O
6. **Configuration:** thread pools, timeouts, caches disabled

## When to performance test
- Before major launches and marketing events
- After architecture changes (new DB, new framework)
- Continuously in CI: a short load test catches **performance regressions** early
- Test environment should be **production-like** (same sizes, same data volume). Results from a tiny test server don't predict production.

## Check yourself
1. Why is p95 better than average?
2. Which test finds memory leaks?
3. What's the difference between load and stress testing?
4. Name 3 common bottleneck locations.
