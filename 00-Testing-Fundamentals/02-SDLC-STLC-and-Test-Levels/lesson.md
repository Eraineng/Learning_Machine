# Lesson 2 — SDLC, STLC and Test Levels

## SDLC — Software Development Life Cycle
The steps to build software:
```
Requirements → Design → Development → Testing → Deployment → Maintenance
```

### Waterfall vs Agile
| | Waterfall | Agile (Scrum) |
|--|-----------|---------------|
| Flow | One phase after another, once | Short cycles (sprints, 1–4 weeks), repeated |
| When testing happens | At the end | Every sprint, continuously |
| Changes | Hard and expensive | Expected and welcome |
| Tester's role | Separate phase/team | Part of the team from day one |

### V-Model: every development phase has a matching test level
```
Requirements ───────────────────────── Acceptance Testing
   System Design ─────────────────── System Testing
      Architecture ─────────────── Integration Testing
         Coding ──────────────── Unit Testing
```
The left side is what you plan and build; the right side is how you test it.

Most teams today use **Agile**, but the V-Model idea (each level of design has its own tests) still applies.

## STLC — Software Testing Life Cycle
| # | Phase | What happens | Output |
|---|-------|--------------|--------|
| 1 | **Requirement analysis** | Read requirements, ask questions, find what's testable | Questions, list of testable items |
| 2 | **Test planning** | Scope, approach, tools, people, schedule, risks | Test plan |
| 3 | **Test case design** | Write scenarios, test cases and test data | Test cases |
| 4 | **Environment setup** | Prepare servers, data, accounts | Ready test environment |
| 5 | **Test execution** | Run tests, log results, report bugs | Results, bug reports |
| 6 | **Test closure** | Summarize results and lessons learned | Test summary report |

## Test Levels
| Level | What is tested | Who (usually) | Example |
|-------|----------------|---------------|---------|
| **Unit** | One function/class, in isolation | Developers | `calculateTax(100)` returns `10` |
| **Integration** | Pieces working together | Developers / testers | API saves an order into the database correctly |
| **System** | The whole application | Testers / QA | Full checkout flow in the test environment |
| **Acceptance (UAT)** | Meets business/user needs | Users, product owner | Customer confirms the report looks the way they need |

Related terms:
- **Alpha testing:** acceptance testing done in-house.
- **Beta testing:** real users try a pre-release version.

## The Test Pyramid
```
          /\
         /UI\         ← few:   slow, fragile, expensive (Playwright UI, E2E)
        /────\
       / API  \       ← some:  medium speed (API / integration tests)
      /────────\
     /  UNIT    \     ← many:  fast, stable, cheap
    /────────────\
```
- **Bottom:** lots of unit tests that run in milliseconds and pinpoint the exact broken function.
- **Middle:** API/integration tests check that the pieces fit together. This is why we learn API testing early!
- **Top:** a few UI/E2E tests for the most important user journeys.

**Anti-pattern, the "ice cream cone":** mostly manual and UI tests, few unit tests. The result is slow, flaky suites that are expensive to maintain.

## Environments
```
Local (dev laptop) → Dev → QA/Test → Staging (copy of prod) → Production
```
A bug that only appears in one environment is often caused by config, data or version differences, so always write the environment in your bug report.

## Check yourself
1. Name the 6 STLC phases in order.
2. A developer tests that `isValidEmail("a@b.com")` returns `true`. Which level?
3. Why should the pyramid have more unit tests than UI tests?
4. In Agile, when does testing start?
