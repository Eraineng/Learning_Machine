# Lesson 1 — Writing Bug Reports That Get Fixed

## The job of a bug report
> Let a developer reproduce and understand the problem **without talking to you** — and make someone care enough to fix it.

A badly written bug is worse than no bug: it wastes the developer's time, gets sent back as "cannot reproduce",
and teaches the team to ignore your reports.

## RIMGEA — the reporting heuristic
| Letter | Step | Why |
|--------|------|-----|
| **R**eplicate | Reproduce it at least twice | Confirms it's real and not a one-off |
| **I**solate | Remove unnecessary steps and variables | 3 steps beat 15 |
| **M**aximize | Find the worst-case impact | "Crashes" beats "shows a warning" — same bug, different priority |
| **G**eneralize | Does it happen elsewhere/other data/browsers? | "Only Safari" vs "all browsers" changes everything |
| **E**xternalize | Explain the business/user impact | Makes the reader care |
| **A**nd say it clearly | Short, factual, neutral | Gets read |

## Anatomy of a great report
```
TITLE     Checkout: total ignores coupon when quantity > 1
ENV       Staging, build 2.4.1, Chrome 128, Windows 11, user test-ann@test.example
SEVERITY  Major   PRIORITY  High   FREQUENCY  5/5
PRECOND   Logged in; coupon SAVE10 active; cart empty
STEPS     1. Add "Blue Mug" (€20) to the cart
          2. Set quantity to 2
          3. Apply coupon SAVE10
          4. Observe the order total
EXPECTED  Total = €36.00  (2 × €20 − 10%)
ACTUAL    Total = €40.00. The coupon shows as "applied" but nothing is deducted.
IMPACT    Every multi-item order with a coupon overcharges the customer → refunds,
          support load, possible consumer-law issue.
EVIDENCE  screenshot.png · HAR file · API response of POST /cart/coupon (200, discount: 0)
NOTES     Works correctly when quantity = 1. Introduced in build 2.4.0 (worked in 2.3.9).
```

## The title formula
**[Where] + [what's wrong] + [under which condition]**
| ❌ | ✅ |
|----|----|
| "Checkout broken" | "Checkout: total ignores coupon when quantity > 1" |
| "Login bug!!!" | "Login: 500 error when the email contains a '+' character" |
| "Doesn't work on mobile" | "Product page: Add-to-cart button is off screen on iPhone SE (375px)" |

A good title lets a manager prioritize without opening the ticket.

## Severity vs priority (interview favorite)
- **Severity** = technical impact (set by the tester)
- **Priority** = fixing order (set by product/lead, business decision)

| | High priority | Low priority |
|--|---------------|--------------|
| **High severity** | Payment crashes for all users | Crash in a legacy page 0.1% of users visit |
| **Low severity** | Company name misspelled on the homepage | Typo in a rarely opened tooltip |

Severity scale: **Critical** (crash, data loss, security, no workaround) → **Major** (key feature broken,
workaround exists) → **Minor** (small functional issue) → **Trivial** (cosmetic).

## Evidence that saves hours
- Screenshot with the problem highlighted; video for timing/animation bugs
- **Browser console** errors and the **network** request/response (or HAR file)
- Server logs / correlation id / timestamp
- For API bugs: the exact request (method, URL, headers, body) and full response
- For automation failures: the **Playwright trace** (folder 07)
- For mobile: device, OS version, `adb logcat` output (folder 13)

## Common mistakes
| Mistake | Fix |
|---------|-----|
| Several bugs in one report | One bug per report |
| "It doesn't work" | Expected vs actual, concretely |
| No steps, or 20 steps | Minimal reproducible steps |
| Missing environment/build | Always include them |
| Blaming ("you broke it") | Describe behavior, not people |
| No evidence | Attach screenshot/logs |
| Not checking for duplicates | Search first |
| Reporting a symptom as the cause | Report what you observed; let devs diagnose |
| Real customer data in the report | Mask it (folder 09) |

## Before you file, ask
1. Is it **really** a bug, or the intended behavior? (Check the requirement.)
2. Is it a **duplicate**?
3. Can I reproduce it **on a clean environment/session**?
4. What's the **smallest** set of steps?
5. Which **build** introduced it? (Regression or always broken?)
6. Would I understand this report in 6 months?

## Try it
1. Rewrite this: *"Search is broken. I typed something and nothing happened. Please fix ASAP!!!"* into a proper report (invent plausible details).
2. Find a real bug on https://www.saucedemo.com with `problem_user` and write a complete report.
3. Take the bugs you found in folder 05 (security) and write 2 reports including the OWASP category and impact.
4. For each of the 14 defects in `tools/sample-defects.json`, decide whether the severity/priority combination looks sensible.
