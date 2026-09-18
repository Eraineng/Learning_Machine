# Test Strategy — <Product / Team>

**Owner:** <name> · **Version:** 1.0 · **Last updated:** YYYY-MM-DD · **Review cadence:** every 6 months

## 1. Purpose and quality goals
<What does "good quality" mean for this product? 3–5 measurable goals.>
- e.g. Checkout works for 99.9% of attempts; p95 page load < 2s; WCAG 2.2 AA; zero critical security findings

## 2. Scope
**In scope:** <systems, platforms, browsers, devices>
**Out of scope:** <what this strategy does not cover, and who covers it>

## 3. Test levels and ownership
| Level | What | Owner | Tooling | When it runs |
|-------|------|-------|---------|--------------|
| Unit | | Developers | | Every push |
| Integration | | Developers / SDET | | Every push |
| Contract | | Both teams | | Every push |
| API | | QA / SDET | | Every push |
| E2E | | QA | | Merge to main |
| Exploratory | | Whole team | — | Each sprint |

## 4. Test types
| Type | Approach | Frequency |
|------|----------|-----------|
| Functional | | |
| Performance | | |
| Security | | |
| Accessibility | | |
| Compatibility | | |
| Visual | | |

## 5. Automation approach
- Target pyramid shape: <e.g. 70% unit, 20% API/integration, 10% UI>
- What is never automated: <usability, exploratory, …>
- Standards: <naming, page objects, no fixed waits, review rules>
- Maintenance budget: <hours/sprint>

## 6. Environments and test data
| Environment | Purpose | Data | Refresh |
|-------------|---------|------|---------|
| Local | | Factories | n/a |
| CI | | In-memory/containers | Per run |
| Staging | | Anonymized subset | Weekly |
| Production | Smoke + monitoring only | Real | n/a |

Data rules: <no real personal data, unique data per test, ownership of reference data>

## 7. Defect management
- Severity definitions: Critical / Major / Minor / Trivial → <what each means here>
- Priority definitions and SLAs: <e.g. Critical fixed within 24h>
- Triage: <who, when, how often>

## 8. Entry / exit criteria
**Entry:** <build deployed, smoke passes, acceptance criteria written…>
**Exit:** <planned high-risk tests executed, 0 open critical, regression green, report published…>

## 9. Metrics and reporting
| Metric | Target | Where it's visible |
|--------|--------|--------------------|
| Pipeline duration | < 10 min for PRs | CI dashboard |
| Flake rate | < 1% | Weekly report |
| Escaped defects | Trend down | Monthly review |

## 10. Risks to the test process itself
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Shared staging is unstable | Blocks E2E | Ephemeral environments per PR |
| Single person knows the framework | Bus factor 1 | Pairing, documentation |

## 11. Roles and responsibilities
| Role | Responsibility |
|------|----------------|
| Developer | Unit + integration tests, fix failing builds |
| QA / SDET | Test design, automation framework, exploratory, reporting |
| Product owner | Acceptance criteria, priority decisions, UAT |
