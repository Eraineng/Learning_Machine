# Topic 5 — Negative Non-Functional Testing: Flight Booking System ⭐

**Runnable lab:** [`../flight-booking-lab/`](../flight-booking-lab/) — **30 tests, all passing**, proving every
scenario below on a vulnerable API and then on a hardened one.

```powershell
cd ../flight-booking-lab
npm install
npm test
```
```
VULNERABLE → confirmed: 20, rejected: 0, seats booked: 20/5      🚨 20 tickets, 5 seats
SAFE       → 50 confirmed, 150 sold out, 0 errors (200 requests) ✅
```

## What "negative non-functional testing" means
Positive functional testing asks *"can a passenger book a seat?"*.
**Negative non-functional** testing asks *"what happens when everything goes wrong at once?"* — concurrency,
hostile users, slow dependencies, dropped connections — and whether the system fails **safely**.

Interview framing:
> "I reverse the requirement. 'The system must not sell more seats than the aircraft has' becomes
> *how do I make it oversell?* Then I attack it with concurrency, tampering and failure injection."

---

## 1. Performance & reliability: overselling and stress
| Scenario | How to test | Expected (safe) behaviour |
|----------|-------------|---------------------------|
| **Race condition on the last seats** | 20 simultaneous `POST /bookings` for a 5-seat flight | Exactly 5 × `201`, 15 × `409`. Never more seats sold than exist |
| **Flash sale / spike** | k6 spike: 10 → 300 VUs in 5s (folder 06) | Latency degrades, but **no overselling and no 5xx**. "Sold out" is a correct answer |
| **Multi-seat family bookings** | Concurrent requests for 3 + 3 + 2 seats on 5 seats | Total sold ≤ capacity |
| **Seat leak on payment failure** | Force the gateway to fail | Seats are released (compensating transaction), no orphan hold |
| **Double-click / retry** | Same request twice with one idempotency key | One booking, one charge |
| **Double cancellation** | Cancel the same booking twice | Second attempt `409`; seat counter never goes negative |
| **Soak** | Normal load for hours (folder 06) | No memory/seat-counter drift; `seats_booked == SUM(confirmed bookings)` |
| **Capacity** | Ramp until failure | Known breaking point + graceful degradation, not a crash |

**Root cause of overselling** (and the fix — say this in the interview):
```sql
-- ❌ read → decide → write  (two requests both see "1 seat left")
SELECT seats_booked FROM flights WHERE id='FL100';
UPDATE flights SET seats_booked = seats_booked + 1 WHERE id='FL100';

-- ✅ atomic conditional update: the DATABASE decides, and you check rows affected
UPDATE flights SET seats_booked = seats_booked + :n
WHERE id='FL100' AND seats_booked + :n <= seats_total;   -- 0 rows changed = sold out
```
Alternatives: `SELECT … FOR UPDATE` (pessimistic lock), optimistic locking with a version column, or a queue
that serializes bookings per flight.

---

## 2. Security: BOLA, price tampering, input abuse
| Scenario | Attack | Expected (safe) behaviour |
|----------|--------|---------------------------|
| **BOLA / IDOR** (OWASP API #1) | Log in as user B, `GET /bookings/{A's id}` | `404` (not 403 — don't confirm the id exists) |
| **BFLA** (function-level) | User B calls `POST /bookings/{A's id}/cancel` | `404`; only the owner may cancel |
| **Price tampering** | Send `{"price": 0.01}` or `-500` in the booking body | Price comes **only** from the server; client field ignored |
| **Mass assignment** | Send `{"status":"confirmed","loyaltyTier":"platinum"}` | Unknown/privileged fields stripped, allow-list binding |
| **Negative/zero/huge seats** | `seats: -3`, `0`, `9999`, `1.5`, `"two"`, `null` | `400`, nothing reserved, counter untouched |
| **Coupon abuse** | Apply the same one-time voucher in parallel requests | Redeemed exactly once (same race-condition family as seats) |
| **Enumeration** | Iterate booking references `ABC001…ABC999` | Rate limiting, non-sequential ids (UUIDs), identical 404s |
| **Auth bypass** | No token, expired token, another tenant's token | `401`; no data leaked |
| **Injection** | `'; DROP TABLE bookings;--`, XSS in the passenger name | Parameterized queries, output escaping (folder 05) |
| **Error leakage** | Malformed JSON, wrong types | Generic message; no stack traces, SQL or framework versions |
| **Payment replay** | Re-submit a captured payment token | Idempotent; no second charge |

> ⭐ Note how **three different failures share one root cause**: trusting the client (price, status, seats)
> and not making state changes atomic. Naming that pattern in an interview is worth more than listing 20 cases.

---

## 3. Resilience: timeouts, network drops, dependency failure
| Scenario | Inject it with | Expected (safe) behaviour |
|----------|----------------|---------------------------|
| **Slow payment gateway** (600ms → 30s) | Fake server with a delay | Client-side timeout (e.g. 3s), fast graceful error, seats released. **Never** an unbounded wait |
| **Gateway 5xx / connection refused** | Force failure | `502` to the user, no booking created, retry with backoff where safe |
| **Client disconnects mid-request** | Abort the request after 10ms | Server completes or rolls back cleanly; a retry with the same idempotency key returns the original booking, not a second one |
| **Partial failure** (seat reserved, payment ok, email fails) | Fail only the email | Booking still valid; email retried asynchronously — *never* roll back a paid booking because of an email |
| **Database connection pool exhausted** | Load + slow queries | Queue or fail fast with 503, no data corruption |
| **Downstream inventory service down** | Kill the fake service | Circuit breaker opens, cached/degraded response, clear user message |
| **Clock/timezone edge** | Book a flight at 23:59 across a DST change | Correct local departure times, no off-by-one-day bookings |
| **Duplicate events from a queue** | Deliver the same message twice | Idempotent consumer: one booking |

**The invariant to assert after any chaos:**
```
seats_booked == SUM(seats of confirmed bookings)
0 <= seats_booked <= seats_total
every confirmed booking has exactly one captured payment for its exact total
```
That's the last test in `tests/03-resilience.test.js` — and it's the same reconciliation thinking as the SQL
data audit in folder 02.

---

## How to answer this in an interview (structure)
1. **Clarify the requirement** → "the aircraft has 180 seats and we must never sell 181"
2. **Reverse it** → "so my goal is to make it sell 181"
3. **Pick the attack vectors** → concurrency, tampering, failure injection, boundary input
4. **Name the mechanism** → "read-then-write race; fix with an atomic conditional update or a lock"
5. **State the business impact** → "denied boarding, EU261 compensation up to €600 per passenger, brand damage"
6. **Say how you'd automate it** → "20 parallel requests in a test; plus a k6 spike profile in the nightly run"

Impact language is what separates senior answers. "The API returns 201 twice" is a bug report;
"two passengers arrive at the gate with a valid boarding pass for the same seat" gets it prioritized.

## Practice
1. `npm test` in the lab; then read each 🔓 test and explain **why** the attack works.
2. Add these scenarios yourself:
   - a one-time voucher redeemed twice in parallel
   - seat-map hold expiry (hold a seat for 10 min, then it must be released)
   - booking a flight that has already departed
3. Write a k6 spike script (folder 06) against `node server.js safe` and confirm no overselling under 300 VUs.
4. Write bug reports (folder 16 template) for the 3 worst vulnerable behaviours, with severity and business impact.
