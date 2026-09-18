# Topic 1 — Test Plan Fundamentals (IEEE 829) ⭐

**Interview frequency:** very high. Usually asked as *"What does a test plan contain?"* or
*"Walk me through how you'd plan testing for feature X."*

## What IEEE 829 is
IEEE 829 is the classic standard for **software test documentation**. (It was formally superseded by
ISO/IEC/IEEE 29119, but interviewers still say "IEEE 829" and expect the same 16 sections.)
Knowing it shows you understand structured testing — even on agile teams that use a one-pager instead.

## The 16 sections (memorize the order — it tells a story)
| # | Section | Answers |
|---|---------|---------|
| 1 | **Test plan identifier** | Unique id/version, e.g. `TP-CHECKOUT-2.4-v1` |
| 2 | **Introduction** | Why this plan exists; scope summary; references (requirements, strategy) |
| 3 | **Test items** | *What* is being tested: builds, modules, versions |
| 4 | **Features to be tested** | Functionality in scope, traceable to requirements |
| 5 | **Features NOT to be tested** | ⭐ Out of scope **and why** — the most professional section |
| 6 | **Approach** | The strategy: levels, types, techniques, automation, tools |
| 7 | **Item pass/fail criteria** | When is one test item considered passed? |
| 8 | **Suspension criteria & resumption requirements** | When do we STOP testing (e.g. smoke fails twice) and what must happen to resume |
| 9 | **Test deliverables** | Cases, scripts, data, reports, defect logs |
| 10 | **Testing tasks** | The work breakdown, with dependencies |
| 11 | **Environmental needs** | Environments, hardware, devices, data, tools, access |
| 12 | **Responsibilities** | Who does what (QA, dev, PO, ops) |
| 13 | **Staffing and training needs** | People, skills, training required |
| 14 | **Schedule** | Milestones and dates tied to the release plan |
| 15 | **Risks and contingencies** | Product and project risks + mitigations |
| 16 | **Approvals** | Who signs off, and when |

### A memory hook
> **"I Introduce the Items and Features (and what I skip), my Approach, my Criteria for pass/fail and for
> stopping, what I Deliver, the Tasks, the Environment, Who does it, Staffing, Schedule, Risks, and Approvals."**

## The 5 sections interviewers actually probe
1. **Features not to be tested** — proves you think about scope and risk, not "test everything"
2. **Entry / exit criteria** (pass-fail) — must be *measurable*
3. **Suspension criteria** — most candidates have never considered this
4. **Risks and contingencies** — links to risk-based testing
5. **Approach** — where you show the test pyramid and automation thinking

### Measurable criteria (say numbers, not adjectives)
```
Entry:   build deployed to QA, smoke suite green, acceptance criteria agreed, test data seeded
Exit:    100% of high-risk cases executed · ≥95% of planned cases executed · 0 open Critical/Major
         · automated regression green on main · p95 < 500ms · no high/critical security findings
Suspend: smoke fails twice in a row · >30% of cases blocked · environment down >4h
Resume:  blocking defect fixed and verified · environment stable for 1h · new build smoke-tested
```

## Test plan vs test strategy vs test case (they WILL ask)
| | Strategy | Plan | Case |
|--|----------|------|------|
| Scope | Organization/product | One release/project | One behavior |
| Lifetime | Years | Per release | Per feature |
| Contains | Levels, types, tools, standards | Scope, schedule, risks, criteria | Steps + expected result |
| Owner | QA lead / head of quality | Test lead / senior QA | Tester |

## The agile answer (add this — it shows modern experience)
> "On agile teams I don't write all 16 sections for every sprint. I keep a living **test strategy** at product
> level, and per epic I write a one-page **test approach**: what's in scope, what isn't, the risks, how we'll
> cover it across unit/API/UI, the test data we need, and the exit criteria. The IEEE 829 sections are still my
> mental checklist — I just deliver them as a Confluence page or a ticket description rather than a 30-page document."

## Model answer (60–90 seconds)
> "A test plan is the document that says *what* we'll test, *how*, *by when*, *by whom*, and *when we'll stop*.
> IEEE 829 structures it in 16 sections — identifier, introduction, test items, features to be tested and
> explicitly **not** tested, the approach, pass/fail criteria, suspension and resumption criteria, deliverables,
> tasks, environment, responsibilities, staffing, schedule, risks, and approvals.
> The sections I care most about in practice are the **scope boundaries**, because 'we're not testing X and here's
> why' is what makes the plan honest; **measurable entry and exit criteria**, so 'done' isn't an opinion; and the
> **risk section**, since that drives what gets deep testing versus a smoke check.
> In my day-to-day agile work this becomes a one-page approach per epic rather than a formal document, but the
> checklist is the same."

## Practice
📄 Templates: `15-Test-Design-and-Strategy/05-Templates/test-plan-template.md` (+ strategy, risk matrix)
1. Write a full IEEE-829-style plan for the **flight booking** feature in `../flight-booking-lab`.
2. Now compress it to one page an agile team would actually read. What did you drop, and why is that safe?
3. Write suspension criteria for a release where staging is shared with another team.
4. Out loud, in 90 seconds: "How would you plan testing for adding seat selection to our booking flow?"
