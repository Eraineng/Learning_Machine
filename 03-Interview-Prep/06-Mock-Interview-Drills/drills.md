# Mock Interview Drills

Practise **out loud**, with a timer. Written answers you can't say fluently are worth very little in an interview.

## How to use this
1. Cover the answers.
2. Set a timer: **60–90 seconds** per question.
3. Record yourself once a week and listen back — you'll hear the filler words and the vague bits.
4. Every technical answer should end with a **concrete example from this repo** ("in my practice project I…").

---

## Round 1 — The five topics (must be automatic)
1. What does a test plan contain? Which sections matter most?
2. Difference between a test strategy, a test plan and a test case?
3. What are entry, exit and suspension criteria? Give measurable examples.
4. Explain INNER JOIN vs LEFT JOIN vs RIGHT JOIN.
5. How would you find orphan records with SQL?
6. How do you verify with SQL that a `POST /orders` really worked?
7. What is penetration testing? How does it differ from a vulnerability scan?
8. Black box vs white box vs grey box — which would you choose and why?
9. Walk me through the phases of a pentest.
10. What is integration testing and why aren't unit tests enough?
11. Top-down vs bottom-up integration — what are stubs and drivers?
12. Describe your API + database verification workflow for a new endpoint.
13. How would you test that a flight booking system can't oversell seats?
14. Give me 5 negative non-functional tests for a booking flow.
15. What's BOLA and how do you test for it?

## Round 2 — Core QA fundamentals
16. What are the 7 testing principles? Give a practical consequence of two of them.
17. Severity vs priority — give an example of high severity / low priority.
18. Explain the test pyramid. What's wrong with an "ice cream cone"?
19. Smoke vs sanity vs regression vs re-testing.
20. What is equivalence partitioning and boundary value analysis? Apply them to an age field (18–60).
21. How do you decide what to automate?
22. What makes a good bug report? Write one for me on the whiteboard.
23. How do you handle a developer saying "cannot reproduce"?
24. You have 3 days instead of 10. What do you test?
25. A test passes locally but fails in CI. How do you investigate?
26. What is a flaky test, what causes it, and how do you handle it?
27. How do you test an API without a UI?
28. What is CI/CD and where do tests fit?
29. What would you do in your first 30 days on our team?
30. Tell me about a bug you're proud of finding.

## Round 3 — Hands-on tasks (be ready to actually do these)
| Task | Where to practise |
|------|-------------------|
| Write 8 test cases for a login form | `00-Testing-Fundamentals/06-Practice` |
| Write a Postman test script validating status + JSON schema | `01-API-Testing/05-Postman-and-Newman` |
| Write a Playwright test with a Page Object | `07-Playwright-UI-Automation` |
| Write a SQL query to find users with no orders / duplicate payments | `02-SQL-for-QA` |
| Find the bug in this API response vs the spec | `10-Contract-Testing` |
| Design test cases for a flight booking (functional + negative + NFT) | `03-Interview-Prep/05-…` |
| Review this test code and tell me what's wrong | `08-Unit-Testing/05-Coverage-and-Good-Tests` |

---

## Model answers (short forms to memorize)

<details><summary>Show model answers for Round 1</summary>

**1. Test plan contents** — See `01-Test-Plan-IEEE-829`. Hit: identifier, intro, items, features in/out of scope,
approach, pass-fail criteria, suspension/resumption, deliverables, tasks, environment, responsibilities, staffing,
schedule, risks, approvals. Emphasize scope boundaries, measurable criteria, risk.

**4. JOINs** — "INNER returns only matching rows from both tables; LEFT returns all left rows with NULLs where the
right has no match; RIGHT is the mirror. For QA the key point is INNER JOIN *hides* broken data while LEFT JOIN
*reveals* it — 9 orders become 8 in a report if one has a deleted user."

**5. Orphans** — "LEFT JOIN the parent table and filter `WHERE parent.id IS NULL`. That anti-join pattern finds
orphan rows, missing payments, unshipped orders — anything where a step didn't happen."

**7. Pentest vs scan** — "A scan is automated detection of known vulnerabilities with false positives. A pentest is
an authorized human simulating a real attacker, exploiting issues to prove business impact, and finding business
logic flaws a scanner can't — like price tampering or BOLA."

**10. Integration testing** — "It verifies components work together: the interfaces and the data across them.
Unit tests with mocks encode what I *believe* the other side does. Integration tests check the belief — wrong column
names, type mismatches, invalid SQL, missing transactions."

**11. Stub vs driver** — "A stub replaces a module that's *called by* the code under test (top-down). A driver
replaces the module that *calls* it (bottom-up)."

**13. Overselling** — "I'd fire 20 concurrent booking requests at a 5-seat flight and assert exactly 5 succeed and
the seat counter never exceeds capacity. The usual root cause is a read-then-write race; the fix is an atomic
conditional UPDATE, a row lock, or optimistic locking. In my practice project the vulnerable version sold 20 tickets
for 5 seats and the hardened version sold exactly 5."

**15. BOLA** — "Broken Object Level Authorization: the API checks that you're logged in, but not that the object
belongs to you. I test it with two accounts — log in as B and request A's booking id. I expect 404 rather than 403,
so an attacker can't confirm which ids exist."

</details>

<details><summary>Show model answers for Round 2 (the tricky ones)</summary>

**17. Severity vs priority** — "Severity is technical impact, set by me; priority is fixing order, set by product.
High severity / low priority: a crash on a legacy page 0.1% of users visit. Low severity / high priority: the CEO's
name misspelled on the homepage."

**23. 'Cannot reproduce'** — "I check my own report first: exact build, environment, data, account and steps. Then I
attach a video or trace, and offer to reproduce it together. If it's intermittent I say so and give the frequency —
'5 out of 20 attempts' is information, not an excuse."

**24. Time cut to 3 days** — "I go back to the risk matrix: test everything scoring high on likelihood × impact —
payments, checkout, login — automate the regression that already exists, and skip low-risk areas. Then I write down
explicitly what wasn't tested and the residual risk, so the release decision is informed."

**26. Flaky tests** — "Same code, different result. Causes: fixed sleeps, shared data, test order dependencies, real
time or randomness, network calls, animations, underpowered CI. I fix the root cause rather than adding retries —
retries hide real intermittent bugs. If I can't fix it immediately I quarantine it with a ticket and an owner."

**30. Bug I'm proud of** — Use the STAR structure and pick a *logic* bug, not a typo. Our lab gives you one:
"a race condition that oversold a flight — 20 tickets for 5 seats — found by firing concurrent requests rather
than clicking one at a time."

</details>

---

## The STAR stories to prepare (write these down, 5 sentences each)
1. A serious bug you found and its business impact
2. A disagreement with a developer, and how you resolved it
3. A time you were under release pressure and how you communicated risk
4. Something you automated that saved the team time (with numbers)
5. A mistake you made in testing and what you changed afterwards
6. How you learned a new tool quickly (this repo is a legitimate answer!)

## Questions to ask THEM (always have 3)
- How is testing split between developers and QA here?
- What does your pipeline run on every PR, and how long does it take?
- How do you handle flaky tests?
- What's your biggest quality pain point right now?
- Is there a test strategy document, and who owns it?
