# Test Design & Strategy — Learning Roadmap

Folder 00 taught the basic techniques. This folder is the **senior-level** version: choosing *what* to test
with limited time, justifying it, and writing it down so a team can follow it.

This is the folder that separates "someone who can write tests" from "someone who decides what the team tests".

```
15-Test-Design-and-Strategy/
├── tools/pairwise.mjs      ✅ RUNNABLE: all-pairs test case generator (240 combos → 21 tests)
├── 01-Advanced-Test-Design/
├── 02-Risk-Based-Testing/
├── 03-Test-Strategy-and-Planning/
├── 04-Automation-Strategy/
├── 05-Templates/           test strategy · test plan · risk matrix · traceability matrix
└── 06-Exercises/
```

## Try the tool
```powershell
cd tools
node pairwise.mjs
```
```
Full combinatorial grid : 240 test cases
Pairwise set            : 21 test cases     (91.3% reduction, all 99 pairs covered)
```

## Checklist
- [ ] `01-Advanced-Test-Design/lesson.md`: pairwise, state machines, decision tables, CRUD & use-case testing
- [ ] `02-Risk-Based-Testing/lesson.md`: risk matrix, prioritization, "what if we don't test this?"
- [ ] `03-Test-Strategy-and-Planning/lesson.md`: strategy vs plan, entry/exit criteria, estimation
- [ ] `04-Automation-Strategy/lesson.md`: what to automate, ROI, framework choices, maintenance
- [ ] `05-Templates/`: fill one in for a real (or imagined) project
- [ ] `06-Exercises/exercises.md`
