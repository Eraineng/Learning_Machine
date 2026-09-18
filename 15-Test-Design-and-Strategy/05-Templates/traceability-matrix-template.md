# Requirements Traceability Matrix — <Release>

Shows that **every requirement has tests**, and that **every test exists for a reason**.

| Req ID | Requirement | Risk | Test cases | Automated | Status | Defects |
|--------|-------------|------|------------|-----------|--------|---------|
| US-12 | User can log in with email | High | TC-001, TC-002, TC-003 | ✅ E2E | ✅ Pass | — |
| US-13 | User can reset password | High | TC-010, TC-011 | ⚠️ partly | 🔄 In progress | BUG-231 |
| US-14 | User can change avatar | Low | — | ❌ | ⚠️ **No coverage** | — |

Legend: ✅ pass · ❌ fail · 🔄 in progress · ⬜ not run

## Coverage summary
| | Count | % |
|--|-------|---|
| Requirements total | | 100% |
| With at least one test | | |
| With automated tests | | |
| High-risk requirements fully covered | | |
| **Requirements with NO coverage** | | ← review these |

## Backward traceability (tests without a requirement)
| Test case | Why it exists | Keep? |
|-----------|---------------|-------|
| TC-099 | Regression test for BUG-118 | ✅ yes — link to the bug |
| TC-140 | Unknown, inherited | ❓ investigate or delete |

> In agile teams this often lives in Jira/Xray links rather than a spreadsheet — but the two questions stay
> the same: *is everything important covered?* and *why does each test exist?*
