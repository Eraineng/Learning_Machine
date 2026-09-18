# Lesson 5 — Writing Test Cases and Bug Reports

## Part 1: Test Cases

### A good test case is…
- **Clear:** anyone on the team can run it without asking you questions
- **Atomic:** it checks one thing
- **Repeatable:** same steps + same data = same result
- **Independent:** it doesn't depend on another test running first
- **Traceable:** it links to a requirement or user story

### Fields
| Field | Example |
|-------|---------|
| ID | TC-LOGIN-003 |
| Title | Login fails with wrong password |
| Requirement | US-12 User login |
| Preconditions | User `ann@test.com` exists with password `Pass1234` |
| Test data | Email: `ann@test.com`, Password: `wrong999` |
| Steps | 1. Open /login  2. Enter email  3. Enter password  4. Click "Log in" |
| Expected result | Error "Invalid email or password" shown; user stays on /login |
| Actual result | *(filled in during execution)* |
| Status | Pass / Fail / Blocked / Not run |
| Priority | High |

### Common beginner mistakes
| ❌ Bad | ✅ Better |
|--------|----------|
| "Check login works" | "Login with valid credentials redirects to /dashboard" |
| "Enter some data" | "Enter email `ann@test.com`" |
| "It should work fine" | "Welcome message 'Hi, Ann' is displayed" |
| One test with 15 checks | Several small tests |

### Traceability matrix
| Requirement | TC-001 | TC-002 | TC-003 | Covered? |
|-------------|--------|--------|--------|----------|
| US-12 Login | ✅ | ✅ | ✅ | Yes |
| US-13 Logout | | | | **No!** |

It shows at a glance which requirements have no tests.

---

## Part 2: Bug Reports

A bug report's job: **let a developer reproduce the bug quickly without talking to you.**

### Fields
| Field | Example |
|-------|---------|
| ID | BUG-231 |
| Title | Checkout: total ignores coupon when quantity > 1 |
| Environment | Staging, build 2.4.1, Chrome 128, Windows 11 |
| Severity | Major |
| Priority | High |
| Preconditions | Logged in; coupon `SAVE10` is active |
| Steps to reproduce | 1. Add "Blue Mug" to cart  2. Set quantity to 2  3. Apply coupon `SAVE10`  4. Look at the total |
| Expected | Total = $36.00 (2 × $20 − 10%) |
| Actual | Total = $40.00 (coupon shown as applied, but not subtracted) |
| Frequency | 5/5 times |
| Attachments | screenshot, console log, API response |
| Notes | Works correctly when quantity = 1 |

### Title formula
**[Where] + [What's wrong] + [When/condition]**
- ❌ "Checkout broken"
- ❌ "Coupon bug!!!"
- ✅ "Checkout: total ignores coupon when quantity > 1"

### Severity vs Priority
- **Severity** = how bad the impact is (technical). Usually set by the tester.
- **Priority** = how soon it should be fixed (business). Usually set by the product owner/lead.

| | High priority | Low priority |
|--|---------------|--------------|
| **High severity** | Payment crashes for all users | App crashes on a legacy page 0.1% of users visit |
| **Low severity** | Company name misspelled on the homepage | Typo in a rarely used settings tooltip |

Severity levels: **Critical** (crash, data loss, no workaround) → **Major** → **Minor** → **Trivial** (cosmetic)

### Bug (defect) life cycle
```
New → Assigned → In Progress → Fixed → Ready for Retest → Verified → Closed
                                           │
                                           └─ still broken ─→ Reopened → Assigned
Other outcomes: Duplicate · Rejected (not a bug) · Deferred (fix later) · Cannot Reproduce
```

### Bug report tips
- **Reproduce it first**, at least twice.
- Give **one bug per report**.
- Include **exact data**: which user, which values, what time.
- Stick to **facts, not blame or emotion**.
- Check for **duplicates** before reporting.
- For API bugs, include the **request (method, URL, body) and the full response**.
- Find the **minimal steps**: remove every step that isn't needed to trigger the bug.

## Templates
- `test-case-template.md`
- `bug-report-template.md`
