# Lesson 4 — Communicating Quality

The most senior skill in testing: turning thousands of details into **a clear, honest picture** that helps
other people make decisions.

## Your audiences
| Audience | Cares about | Tell them |
|----------|-------------|-----------|
| **Developers** | What broke, how to reproduce | Precise reports, traces, logs |
| **Product owner** | Can we ship? what's the user impact? | Risks, blockers, workarounds, recommendation |
| **Managers/execs** | Confidence, timeline, cost | One-paragraph status, trend, decision needed |
| **Support/ops** | What will users hit? | Known issues + workarounds before release |

Same facts, different altitude. Never give an exec a list of 40 bug ids.

## The daily/weekly status (short!)
> **Checkout release — day 3 of 5**
> Executed 120/180 planned tests (67%). 8 defects found: 1 critical (payment retry loop, blocks
> release, fix ETA today), 3 major, 4 minor. Coupon area is where most issues cluster.
> **Risk:** staging was down for 4h, so performance testing slipped to tomorrow.
> **Need from you:** a decision on BUG-213 (currency symbol) — fix now or accept for this release?

Structure: **progress → findings → risks → what I need**.

## The go / no-go recommendation
You don't decide whether to release — you make sure the decision is **informed**. Give a recommendation
with evidence and the residual risk:

> ✅ **Go, with monitoring.** All high-risk areas tested and passing. 0 open critical/major defects.
> 4 minor defects accepted for the next release (list attached). Not covered this cycle: bulk export
> (low usage, workaround exists). Recommend watching checkout error rates for 24h after deploy and
> keeping a rollback ready.

> ❌ **No-go.** BUG-207 (order confirmation emails not sent) is open and critical: customers would pay
> with no confirmation, which will generate support load and chargebacks. No workaround.
> Recommend fixing and re-testing (est. 1 day) before release.

### Never say
- "It's fully tested" / "there are no bugs" — impossible (folder 00, principle 1)
- "QA approves the release" — quality is a **team** responsibility; you inform, the business decides
- A bare "I have a bad feeling" — translate intuition into concrete risks

## The test summary report (end of a release)
See `05-Templates/test-summary-report-template.md`. Structure:
1. Executive summary (5 lines, readable by anyone)
2. Scope: what was and wasn't tested
3. Execution stats: planned/executed/passed/failed/blocked
4. Defect summary by severity + the open ones
5. Risks and residual risk
6. Environment/data notes and any blockers hit
7. Recommendation
8. Lessons learned / improvements for next time

## Metrics that help (and ones that hurt)
| ✅ Useful | ❌ Harmful |
|-----------|-----------|
| Open critical/major defects | Bugs found per tester |
| DDP (escaped vs found) | Number of test cases written |
| Test execution progress vs plan | 100% coverage targets |
| Flake rate, pipeline duration | Lines of test code |
| Defect clustering by module | Bugs caused per developer |
| Time to detect / time to fix | "QA sign-off" as a gate to blame |

Show **trends**, not single numbers: "escaped defects: 7 → 4 → 2 over three releases" tells a story.

## Advocating for quality without being "the police"
- Bring **data**: "the checkout module produced 43% of defects last quarter"
- Speak in **user and money terms**, not test terms
- Offer options, not ultimatums: "we can ship Friday without the bulk-export feature, or Monday with it"
- Celebrate prevention: bugs avoided in refinement are cheaper than bugs found in testing
- Make quality **visible**: dashboards, a known-issues list, a weekly 5-minute quality slot in standup

## Handling pressure to approve a release
When asked "is it ready?" under pressure:
1. State the facts (executed, passed, open defects)
2. State the risks in user impact terms
3. Give your recommendation
4. Make it explicit who is accepting the risk if they go anyway — in writing, politely
> "Understood. To confirm: we're releasing with BUG-207 open, which means customers may not receive
> confirmation emails. Product accepts this risk, and support has been informed. I'll monitor after deploy."

That is professional, not obstructive — and it protects everyone.

## Try it
1. Run `node tools/defect-metrics.mjs` and write the go/no-go paragraph for that data.
2. Write a 5-line daily status for the middle of that release.
3. Fill in the test summary report template for any project in this repo.
4. Rewrite this for an exec audience: *"We ran 340 cases, 12 failed, 3 are P1s in the coupon module, and staging was flaky."*
