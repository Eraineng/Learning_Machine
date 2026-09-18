# Unit Testing — Learning Roadmap

The **base of the test pyramid**: many small, fast tests for individual functions and classes.
Tool: **Vitest** (modern and fast; its API is almost identical to **Jest**, so you learn both at once).

```
unit-project/
├── src/                    code under test
│   ├── math.ts             pure functions
│   ├── cart.ts             a class with state
│   ├── password.ts         validation rules
│   ├── orderService.ts     class with dependencies (for mocks)
│   └── userService.ts      async code + timers
└── tests/
    ├── 01-basics.test.ts       (lesson 1)
    ├── 02-cart.test.ts         (lesson 2)
    ├── 03-password.test.ts     (lesson 2)
    ├── 04-mocks.test.ts        (lesson 3)
    └── 05-async.test.ts        (lesson 3)
```

## Setup
```powershell
cd unit-project
npm install
npm test               # run once
npm run test:watch     # re-run on every save (use this while coding!)
npm run coverage       # coverage report → coverage/index.html
```
VS Code: install the **Vitest** extension (vitest.explorer) for ▶ buttons next to tests.

## Checklist
- [ ] `01-Unit-Testing-Basics/lesson.md`: what a unit is, AAA, FIRST
- [ ] `02-Matchers-and-Structure/lesson.md`: describe/it, hooks, matchers, parameterized tests
- [ ] `03-Mocks-Stubs-Spies/lesson.md`: test doubles, async, fake timers
- [ ] `04-TDD/lesson.md`: Red → Green → Refactor
- [ ] `05-Coverage-and-Good-Tests/lesson.md`: coverage, mutation testing, smells
- [ ] `06-Exercises/exercises.md`
