# Root Cause Analysis — <BUG-ID: title>

**Date:** · **Facilitator:** · **Participants:** <dev, QA, product, ops>
**Severity:** · **Found in:** <test / production> · **Customers affected:** · **Duration of impact:**

> RCA is **blameless**. The goal is to fix the system that allowed the defect, not to find a person.

## 1. What happened (timeline, facts only)
| Time | Event |
|------|-------|
| | Change deployed |
| | First customer report |
| | Detected by the team |
| | Mitigated |
| | Resolved |

**Impact:** <users affected, revenue, support tickets, data integrity>

## 2. Why did the defect happen? (5 Whys)
1. Why? →
2. Why? →
3. Why? →
4. Why? →
5. Why? → **root cause:**

## 3. Why wasn't it caught? (the tester's question)
| Stage | Should it have been caught here? | Why wasn't it? |
|-------|-------------------------------|----------------|
| Requirements/refinement | | |
| Code review | | |
| Unit tests | | |
| Integration/API tests | | |
| E2E / exploratory | | |
| Monitoring/alerting | | |

## 4. Contributing factors
- <unclear requirement · missing test data · time pressure · knowledge gap · flaky test disabled · no alerting>

## 5. Actions
| # | Action | Type (prevent / detect / mitigate) | Owner | Due |
|---|--------|-----------------------------------|-------|-----|
| 1 | Add automated test at <level> for <case> | detect | | |
| 2 | <process change> | prevent | | |
| 3 | <alert / monitor> | detect | | |

⭐ At least one action must be a **new automated test**, and at least one must address the **process**,
not just this single bug.

## 6. Follow-up
- [ ] Actions created as tickets and linked to this RCA
- [ ] New test added and passing (link)
- [ ] Reviewed in the next retro
