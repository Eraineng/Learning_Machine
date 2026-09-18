# Lesson 2 — Risk-Based Testing

## The core question
You have 2 days and 3 weeks' worth of tests. **What do you test?**

Risk-based testing answers it with data instead of gut feeling, and — just as importantly — lets you
**explain and defend** your choices to managers.

## Risk = Likelihood × Impact
| | Meaning | Ask |
|--|---------|-----|
| **Likelihood** | How likely is a defect here? | New code? Complex? Changed often? New team? Legacy? Poor test coverage? Rushed? Many past bugs? |
| **Impact** | How bad if it fails? | Money lost? Users blocked? Legal/safety? Data loss? Reputation? Frequency of use? Workaround available? |

Score each 1–5 and multiply → a **risk score** of 1–25.

## Example risk matrix (an e-commerce release)
| # | Feature / risk | Likelihood | Impact | Score | Test approach |
|---|----------------|-----------|--------|-------|---------------|
| 1 | Payment processing (new provider) | 5 | 5 | **25** | Full manual + automated E2E, all card types, failure paths, security review |
| 2 | Checkout with coupons (refactored) | 4 | 5 | **20** | Automated regression + exploratory session |
| 3 | Login / session (unchanged) | 2 | 5 | **10** | Automated smoke only |
| 4 | Product search (new ranking) | 4 | 3 | **12** | Automated + exploratory |
| 5 | Order history page | 2 | 2 | **4** | Smoke check |
| 6 | Admin colour theme | 1 | 1 | **1** | Not tested this release |

```
Impact
  5 │  (3)        (2)(1)
  4 │
  3 │        (4)
  2 │  (5)
  1 │ (6)
    └───────────────────── Likelihood
      1   2   3   4   5
```
Top-right = test hard. Bottom-left = accept the risk consciously.

## How to build it (a 60-minute workshop)
1. Invite developers, product owner, support and ops — **risk assessment is a team activity**
2. List features/components/changes in this release
3. Score likelihood and impact together (disagreements are the most valuable part!)
4. Sort by score
5. Decide the test approach per band (deep / standard / smoke / none)
6. Write down what you are **not** testing, and why ← the most professional thing in the document
7. Re-visit it during the release as things change

## Sources of information
- Change log / git diff: what actually changed?
- Defect history: where were bugs found before? (defect clustering, folder 00)
- Production incidents and support tickets
- Code complexity and coverage reports
- Developer intuition ("that module scares me")
- Analytics: which features do users actually use?

## Using it day to day
- **Regression selection:** run the full suite nightly; on PRs run the high-risk subset
- **Time is cut in half:** you already know what to drop, and can say so with a straight face
- **Sign-off conversation:** "We tested everything scoring ≥ 12. Items 5 and 6 were not tested. Here's the residual risk."

## Risk in agile
- Per story: "what could go wrong with this?" during refinement
- Risk-based **acceptance criteria**: the riskiest behaviors become explicit criteria
- A "risk radar" the team revisits each sprint

## Communicating residual risk
Never say "it works" or "it's fully tested" (impossible — principle 2 in folder 00). Say:
> "We executed 94% of planned tests. All high-risk areas passed. Two medium-risk areas were not covered:
> bulk export (workaround exists) and the admin theme. Known open defects: 1 major (with workaround), 4 minor.
> My recommendation: go, with monitoring on checkout error rates for the first 24 hours."

That's what a senior tester sounds like.

## Try it
1. Build a risk matrix for the security project in folder 05: 8 rows, scored, with a test approach per row.
2. Take any app you use daily. What are its top 3 risks? What would you test first with only 4 hours?
3. Write the residual-risk paragraph for a release where the payment tests couldn't be completed.
