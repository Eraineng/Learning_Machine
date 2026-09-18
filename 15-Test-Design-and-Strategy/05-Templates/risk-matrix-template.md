# Risk Matrix — <Release>

**Workshop date:** · **Participants:** <QA, dev, product, support, ops>

## Scoring guide
**Likelihood (probability a defect exists here)**
| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Unchanged, well covered | Minor change | Moderate change | New/complex code, past bugs | New tech, rushed, no coverage |

**Impact (consequence if it fails in production)**
| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Cosmetic | Annoying, workaround exists | Feature unusable for some | Revenue/data loss for many | Safety, legal, total outage |

## Matrix
| # | Area / change | L | I | Score | Rationale | Test approach | Owner |
|---|---------------|---|---|-------|-----------|---------------|-------|
| 1 | | | | | | Deep: manual + automated + exploratory | |
| 2 | | | | | | Standard: automated regression | |
| 3 | | | | | | Smoke only | |
| 4 | | | | | | **Not tested** — accepted risk | |

**Bands:** 20–25 deep · 12–19 standard · 6–11 smoke · 1–5 accept

## Not testing (conscious decisions)
| Area | Score | Why we accept this risk | Who approved |
|------|-------|------------------------|--------------|
| | | | |

## Residual risk statement (for the release note)
> We executed __% of planned tests. All areas scoring ≥ __ passed. Not covered: <…>.
> Open defects: <n critical, n major, n minor>. Recommendation: <go / no-go>, with <monitoring/mitigation>.
