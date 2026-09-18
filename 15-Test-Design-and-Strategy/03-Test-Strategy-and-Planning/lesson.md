# Lesson 3 — Test Strategy and Planning

## Strategy vs plan vs cases
| Document | Scope | Question | Lifetime |
|----------|-------|----------|----------|
| **Test policy** | Organization | Why do we test? What does quality mean here? | Years |
| **Test strategy** | Organization / product | *How* do we test in general? Levels, types, tools, environments, roles | Years, rarely changed |
| **Test plan** | One project/release | *What, when, who* for this specific release | Per project/release |
| **Test cases / charters** | One feature | Concrete steps and expectations | Per feature |

Many agile teams replace heavy plans with a **one-page test approach** per epic — but the *thinking* is identical.

## What a test strategy contains
1. **Scope and objectives** — what quality means for this product
2. **Test levels** — unit / integration / system / acceptance, and who owns each
3. **Test types** — functional, performance, security, accessibility, compatibility…
4. **Automation approach** — the pyramid, tools, standards, what stays manual
5. **Environments and data** — which environments exist, how they're refreshed, data rules (folder 09)
6. **Entry/exit criteria and definition of done**
7. **Defect management** — severity/priority definitions, triage, SLAs
8. **Roles and responsibilities** — who tests what; developers vs QA vs product
9. **Metrics and reporting** — what is measured, where it's visible
10. **Risks and mitigations**

## What a test plan adds (per release)
- Features in scope / **explicitly out of scope**
- Schedule and milestones, dependencies
- Resources (people, devices, licences, environments)
- Test deliverables (cases, reports, evidence)
- Risk matrix (lesson 2)
- Entry/exit criteria for this release
- Suspension/resumption criteria ("if the build fails smoke tests twice, testing stops and the build is rejected")

## Entry and exit criteria (make them measurable)
**Entry (before testing starts):**
- Build deployed to the test environment and passes smoke tests
- Acceptance criteria written; unit tests green; code review done
- Test data and environment ready

**Exit (before release):**
- 100% of planned high-risk tests executed
- ≥ 95% of planned tests executed overall
- 0 open critical/major defects (or accepted with a documented workaround)
- Automated regression suite green on main
- Performance within SLOs; no high/critical security findings
- Test summary report published and signed off

❌ Bad: "testing is complete". ✅ Good: criteria a machine or a manager can verify.

## Estimating test effort
| Technique | How |
|-----------|-----|
| **Ratio to development** | Testing ≈ 25–50% of dev effort (organization-specific) |
| **Per test case** | Historical average × number of cases (e.g. 15 min/case to write, 5 to run) |
| **Three-point** | (Optimistic + 4×Likely + Pessimistic) / 6 |
| **Historical velocity** | What similar past releases actually took ⭐ most reliable |

Always add buffer for: environment problems, re-testing after fixes (usually **2–3 rounds**), and the bugs you'll find.
A common mistake: estimating only the *first* execution.

## Test in agile: where testing happens
```
Refinement  → testers ask questions, spot ambiguity (cheapest bug prevention there is)
Planning    → testing tasks + acceptance criteria are part of the story
Development → TDD/unit tests, API tests written alongside code
In sprint   → exploratory testing, automation of new cases, regression in CI
Review/demo → acceptance by the product owner
Retro       → improve the process, address flaky tests and slow pipelines
```
**Definition of Done** should include: tests written and passing, automated regression updated, no new critical bugs,
accessibility checked, documentation updated.

**Shift left** (test earlier: requirements review, static analysis, unit tests)
**Shift right** (test in production: monitoring, canary releases, synthetic tests, chaos engineering)

## Test estimation, planning and reality
Plans are wrong the moment they're written. What matters is:
- The **thinking** (risks, scope, criteria) is explicit and shared
- The plan is short enough that people actually read it
- It's updated when reality changes, and the changes are communicated

## Try it
1. Fill in `05-Templates/test-strategy-template.md` for this learning repo as if it were a product.
2. Write a one-page test plan for "add PayPal to checkout", including entry/exit criteria and a risk matrix.
3. Estimate the effort to test that feature using two different techniques. How far apart are they?
4. Write the Definition of Done for a team that ships daily.
