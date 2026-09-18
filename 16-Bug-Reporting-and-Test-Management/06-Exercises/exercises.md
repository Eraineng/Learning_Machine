# Bug Reporting & Test Management — Exercises

## Level 1 — Bug reports
1. Rewrite these into proper reports (invent plausible details, use the template in folder 00):
   a. "Search is broken, nothing happens. Fix ASAP!!!"
   b. "Profile page is weird — sometimes the picture is wrong, the date format is strange and the save button is ugly."
   c. "App crashed."
2. Apply **RIMGEA** to one real bug you find on https://www.saucedemo.com (`problem_user`) — show each step.
3. For 5 defects in `tools/sample-defects.json`, write the severity/priority justification you'd give in triage.
4. Write a bug report for an **API** defect from folder 05 (include request, response and OWASP category).

## Level 2 — Lifecycle and metrics
5. Run `node tools/defect-metrics.mjs`. Write a 5-line status update for the product owner from that data.
6. Add 6 more defects to `sample-defects.json` (including 2 more production escapes) and re-run. How do DDP and the recommendation change?
7. Extend the script: add "average age of open defects by severity" and a simple 4-week trend of found vs fixed.
8. Do a full **5 Whys** RCA for BUG-207 using the RCA template, including "why didn't we catch it" and 3 actions.

## Level 3 — Management
9. Organize the tests of folder 07 into a suite structure with tags (@smoke, @regression, @checkout) and write the test run plan.
10. Write 5 JQL queries for a release dashboard (blockers, escapes, ready-for-retest, ageing, my open bugs).
11. Build a traceability matrix for 5 requirements of any project here, linking to actual test files.
12. Set up a free TestRail/Jira trial (or a spreadsheet) and enter a full test run with results.

## Level 4 — Communication
13. Fill in the **test summary report** for one project in this repo as if you had just finished testing it.
14. Complete the **release readiness checklist** for that project. What's genuinely not ready?
15. Write both a **GO** and a **NO-GO** recommendation paragraph for the same defect data, and note what evidence distinguishes them.
16. Role-play: the product manager says "ship it anyway, the bug is rare". Write your reply (professional, factual, with the risk acceptance in writing).

## Level 5 — Portfolio
17. Take one project from this repo end-to-end: risk matrix (folder 15) → test plan → executed tests → 3 bug reports → defect metrics → test summary report → release recommendation. This is exactly what an interview task looks like.
18. Write a one-page "how we handle defects" document for a new team member: lifecycle, severity scale, triage, SLAs, and what a good report contains.

## Quiz
1. What does RIMGEA stand for?
2. Severity vs priority — who sets each?
3. Who should close a defect, and after what?
4. What is DDP and what does a low value mean?
5. Why is a high reopen rate a process problem?
6. Name 3 metrics that are harmful to track.
7. What must every escaped defect produce?
8. What should you never claim in a release meeting?

<details><summary>Answers</summary>

1. Replicate, Isolate, Maximize, Generalize, Externalize, And say it clearly.
2. Severity = technical impact, set by the tester; priority = fixing order, set by product/business.
3. The tester, after verifying the fix on the correct build, testing around it, and running regression.
4. Defect Detection Percentage: defects found in testing ÷ (found in testing + found in production). Low = too many escapes, so coverage gaps.
5. It means "fixed" isn't verified before being declared done — fixes are shipped without checking.
6. Bugs found per tester, number of test cases, bugs caused per developer, lines of test code, 100% coverage targets (any 3).
7. A new automated test (plus an RCA for serious ones).
8. That the product is "fully tested" or "bug-free", or that QA "approves" the release — you inform the decision, the business owns it.

</details>
