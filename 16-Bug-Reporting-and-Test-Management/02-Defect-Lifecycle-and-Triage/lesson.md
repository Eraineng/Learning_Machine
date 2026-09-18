# Lesson 2 — Defect Lifecycle, Triage and Root Cause Analysis

## The lifecycle
```
                  ┌──────────── Rejected (not a bug / works as designed)
                  ├──────────── Duplicate
   New ──► Triaged ──► Assigned ──► In Progress ──► Fixed ──► Ready for Retest
                  └──────────── Deferred (real, but not now)      │
                                                                   ├─ verified ──► Closed
                                                                   └─ still broken ──► Reopened ──► Assigned
```
**The tester owns two transitions**: reporting (New) and **verifying the fix** (Closed or Reopened).
Nobody else should close a bug as "fixed" without verification.

### Re-testing a fix properly
1. Reproduce the original steps exactly → is it fixed?
2. Test **around** it: related fields, boundary values, the other browser
3. Run **regression** on the area (did the fix break something else?)
4. Check the fix is in the build you're testing (build number!)
5. Only then close, with a note: "Verified on build 2.4.2, Chrome 128"

## Triage
A short, regular meeting (daily or 2–3×/week) where product, dev lead and QA decide what happens to new defects.

**Agenda per defect:** is it valid? is it a duplicate? severity/priority? who fixes it? which release?

**Decisions available:** fix now · fix later (backlog/deferred) · won't fix · needs more info · not a bug · duplicate.

**As the tester, come prepared with:** impact, frequency, whether there's a workaround, and how many users are affected.
That's what turns "I think it's important" into a decision.

## Handling pushback
| Developer says | Your response |
|----------------|---------------|
| "Cannot reproduce" | Add exact environment, build, data, video, and offer to show it live |
| "Works as designed" | Point to the requirement/AC; if the spec is ambiguous, escalate to product — the ambiguity is the real bug |
| "Not my code" | Fine — help find the owner; keep the ticket open |
| "That's an edge case" | Quantify: "3% of our users use PayPal" |
| "It's just cosmetic" | Externalize impact: "it's on the pricing page — customers see it first" |

Stay factual and unemotional. You're both trying to ship something good.

## Root cause analysis (RCA)
For serious or repeated defects, ask **why the bug happened AND why it wasn't caught**.

### 5 Whys
> Customers were overcharged on multi-item coupon orders.
1. Why? The discount was applied to the unit price, not the line total.
2. Why? The requirement didn't state how coupons apply to quantities.
3. Why? Acceptance criteria were written without an example table.
4. Why? The team had no refinement checklist for pricing rules.
5. Why? **Pricing changes aren't treated as high risk.** → Action: risk-based refinement checklist + example-based ACs.

Note how the first answer is a code fix, and the fifth is a **process fix**. Both matter.

### The second question (the tester's question)
> Why didn't our tests catch it?

| Gap | Action |
|-----|--------|
| No test for that combination | Add it (unit level if possible) |
| Test existed but was skipped/quarantined | Fix and re-enable |
| Test environment lacked realistic data | Improve test data (folder 09) |
| Only tested quantity = 1 | Add boundary/EP cases (folder 00) |
| Nobody owns that area | Update the risk matrix (folder 15) |

**Every escaped defect should produce a new automated test.** That's how a suite gets genuinely valuable.

## Defect metrics (`tools/defect-metrics.mjs`)
| Metric | Meaning | Watch for |
|--------|---------|-----------|
| **Open Critical/Major** | Release blockers | Must be 0 (or formally accepted) |
| **DDP** (Defect Detection Percentage) | found_in_test / (found_in_test + found_in_prod) | < 90% → coverage gaps |
| **Reopen rate** | Fixes that didn't work | > 10% → "done" isn't verified |
| **Rejected/duplicate rate** | Report quality & requirement clarity | > 15% → improve reports or specs |
| **Defect age** | How long bugs sit open | Old criticals = process failure |
| **Time to fix** | Responsiveness | Compare against SLA per severity |
| **Clustering by module** | Where bugs live | Focus testing there (principle 4, folder 00) |
| **Defect density** | Bugs per module/KLOC/story point | Compare modules, not people |

⚠️ **Never use defect counts to evaluate people.** "Bugs found per tester" produces inflated trivial reports;
"bugs caused per developer" produces hidden bugs. Metrics measure the **process**.

## Try it
1. Run `node tools/defect-metrics.mjs`. Which two defects block the release, and what would you say in the go/no-go meeting?
2. The reopen rate is 14.3%. What process change would you propose?
3. Do a 5 Whys for BUG-207 ("Order confirmation email not sent", found in production).
4. Write the "why didn't we catch it?" analysis and name the exact test you'd add, at which level.
