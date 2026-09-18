# Defect Triage — Agenda & Notes

**Date:** · **Attendees:** <product owner, dev lead, QA> · **Duration:** 20–30 min · **Cadence:** <daily / Mon-Wed-Fri>

## Before the meeting (QA prepares)
- [ ] All new defects have complete reports (steps, evidence, environment)
- [ ] Duplicates already merged
- [ ] Each defect has a proposed severity and a note on impact/workaround/frequency

## Agenda
1. **New defects** (the main part) — for each:
   | Question | |
   |----------|--|
   | Valid? Duplicate? | |
   | Severity (technical impact) | |
   | Priority (business urgency) | |
   | Fix now / next release / won't fix? | |
   | Assigned to | |
2. **Reopened defects** — why did the fix fail?
3. **Ageing defects** — anything open > __ days
4. **Blockers** — anything stopping testing right now
5. **Trends** — clustering, escape rate (2 minutes, weekly)

## Decisions log
| Defect | Severity | Priority | Decision | Owner | Target release |
|--------|----------|----------|----------|-------|----------------|
| | | | | | |

## Rules that keep triage short
- No debugging in the meeting — decide and assign, discuss details offline
- No re-litigating severity every day; agree the scale once (see the test strategy)
- "Needs more info" is a valid outcome — but it goes back to a named person with a deadline
- Anything Critical is handled immediately, not at the next triage
