# Testing Fundamentals Quiz (20 questions)

Answer everything first, then check at the bottom. Pass mark: **16/20**.

## Multiple choice
1. A developer typed `>` instead of `>=`. That wrong code is a:
   a) error  b) defect  c) failure  d) incident
2. "Exhaustive testing is impossible" means:
   a) never test everything, so skip testing  b) use risk and techniques to choose tests  c) automate everything  d) test only happy paths
3. Running the same tests for months finds fewer new bugs. Which principle?
   a) defect clustering  b) early testing  c) pesticide paradox  d) context dependent
4. "Are we building the right product?" is:
   a) verification  b) validation  c) regression  d) QC
5. Which test level checks a single function in isolation?
   a) unit  b) integration  c) system  d) acceptance
6. The test pyramid says you should have the **most**:
   a) UI tests  b) manual tests  c) API tests  d) unit tests
7. A quick, broad check that a new build is stable enough to test is:
   a) sanity  b) smoke  c) regression  d) exploratory
8. Checking that a bug fix didn't break other features is:
   a) re-testing  b) smoke  c) regression  d) acceptance
9. "Checkout handles 2,000 concurrent users" is:
   a) functional  b) non-functional  c) unit  d) white-box
10. Testing without knowledge of the internal code is:
    a) white-box  b) grey-box  c) black-box  d) unit
11. Valid range 1–100. Which set is the classic BVA set?
    a) 1, 50, 100  b) 0, 1, 100, 101  c) -1, 0, 50  d) 2, 99
12. Decision tables are best for:
    a) numeric ranges  b) combinations of conditions  c) UI layout  d) performance
13. Which testing technique fits "account locks after 3 failed logins"?
    a) BVA  b) state transition  c) EP  d) pairwise
14. Severity describes:
    a) how soon to fix  b) business importance  c) technical impact  d) who fixes it
15. Which is the best bug title?
    a) "Login broken!!"  b) "Bug"  c) "Login: 500 error when email contains '+'"  d) "Please fix login"
16. Which STLC phase produces the test plan?
    a) requirement analysis  b) test planning  c) test design  d) test closure
17. Which is the best candidate for automation?
    a) usability of a new design  b) regression suite run every day  c) one-time data check  d) exploratory session

## True / False
18. If all tests pass, the software has no defects.
19. A bug can be high severity but low priority.
20. In Agile, testing only starts after development is finished.

---

## Answers
<details>
<summary>Click to show</summary>

1. **b** defect (the human mistake was the error; the wrong behavior at runtime is the failure)
2. **b**
3. **c** pesticide paradox
4. **b** validation
5. **a** unit
6. **d** unit
7. **b** smoke
8. **c** regression
9. **b** non-functional (performance/load)
10. **c** black-box
11. **b** 0, 1, 100, 101
12. **b**
13. **b** state transition
14. **c** technical impact
15. **c**
16. **b** test planning
17. **b**
18. **False.** Testing shows the presence of defects, not their absence.
19. **True.** Example: a crash on a page almost nobody uses.
20. **False.** Testing happens continuously, every sprint, from the start.

</details>
