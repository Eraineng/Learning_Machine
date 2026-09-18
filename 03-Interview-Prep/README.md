# Interview Prep & Gap Closing 🎯

The five topics you listed, answered at interview depth, plus a runnable lab that lets you say
*"I've actually done this"* instead of *"I've read about it"*.

```
03-Interview-Prep/
├── 01-Test-Plan-IEEE-829/          the 16 sections + the agile version + a model answer
├── 02-SQL-JOIN-Answers/            condensed answers (full hands-on lives in folder 02)
├── 03-Penetration-Testing/         definition, box types, PTES phases, pentest vs vuln scan
├── 04-Integration-Testing-Answers/ approaches, stubs vs drivers, the API+DB verification workflow
├── 05-Negative-NFT-Flight-Booking/ the complete reverse-testing scenario bank
├── 06-Mock-Interview-Drills/       45 questions + model answers + STAR stories
└── flight-booking-lab/             ✅ RUNNABLE: 30 tests proving the negative NFT scenarios
```

## The lab, in one command
```powershell
cd flight-booking-lab
npm install
npm test
```
```
VULNERABLE → confirmed: 20, rejected: 0, seats booked: 20/5     🚨 20 tickets for 5 seats
VULNERABLE under load → 75 confirmed on a 50-seat flight        🚨
SAFE → 200 requests: 50 confirmed, 150 sold out, 0 errors       ✅
30 tests passed
```
It proves, side by side on the same API: **overselling races, seat leaks, double-submit, BOLA, BFLA,
price tampering, negative-seat abuse, gateway timeouts and client disconnects** — and the fix for each.

Explore it by hand too:
```powershell
node server.js vulnerable     # http://127.0.0.1:5001
node server.js safe           # http://127.0.0.1:5002
```

## Your 5 topics → where the depth is
| # | Topic | Read | Practise |
|---|-------|------|----------|
| 1 | Test plan / IEEE 829 | `01-Test-Plan-IEEE-829` | Templates in `15-Test-Design-and-Strategy/05-Templates` |
| 2 | SQL JOINs | `02-SQL-JOIN-Answers` | **`02-SQL-for-QA`** — 26 tests, 12 seeded defects, audit tool |
| 3 | Penetration testing | `03-Penetration-Testing` | `05-Security-Testing` — 41 attack/defence tests |
| 4 | Integration testing | `04-Integration-Testing-Answers` | `04-Integration-Testing` — 23 tests |
| 5 | Negative NFT (flight booking) | `05-Negative-NFT-Flight-Booking` | `flight-booking-lab` — 30 tests |

## Your 4 core skills → where they now live
| Skill | Where | Status |
|-------|-------|--------|
| **API testing & Postman** | `01-API-Testing/05-Postman-and-Newman` | ✅ NEW — collection with 24 assertions + newman + CSV data-driven |
| **Automation mechanics (POM, selectors, assertions)** | `07-Playwright-UI-Automation` | ✅ 36 tests, page objects, fixtures |
| **SQL & data verification** | `02-SQL-for-QA` | ✅ NEW — JOINs, orphans, dirty writes, audit script |
| **Non-functional & OWASP** | `05-Performance`, `06-Security`, `16/flight-booking-lab` | ✅ k6 + 41 security tests + 30 lab tests |

## How to rehearse
1. Read the lesson → 2. Run the tests in the linked folder → 3. Answer the drills **out loud** in 90 seconds
→ 4. Be able to say "in my project I did X, here's the number".

Numbers you can quote in an interview (all real, all from your repo):
- "I built an API test suite with **24 Postman assertions** including JSON schema validation, running headless in CI via newman."
- "I wrote **26 SQL tests** that find orphan records, double charges and totals that don't reconcile."
- "I proved a **race condition that sold 20 tickets for 5 seats**, then fixed it with an atomic conditional update."
- "I have **41 security tests** covering the OWASP Top 10 — SQL injection, XSS, BOLA, mass assignment, brute force."
