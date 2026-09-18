# Lesson 1 — What Is Software Testing?

## Definition
**Software testing** is checking whether software does what it should, and finding problems
**before users do**, so the team can decide whether the product is good enough to release.

Testing is not only "clicking around looking for bugs". It includes:
- Reviewing requirements (finding problems before any code exists)
- Designing test cases
- Running tests (by hand or automated)
- Reporting and tracking bugs
- Giving the team information to make release decisions

## Why test?
- **Money** — a bug found in requirements costs a few minutes; the same bug in production can cost a lot (refunds, hotfixes, lost customers).
- **Safety** — medical devices, cars, banking.
- **Reputation** — users leave apps that crash.
- **Confidence** — the team can change code without fear.

> The later a bug is found, the more it costs to fix.
> Requirements → Design → Code → Test → Production: cost grows at each step.

## Error → Defect → Failure
| Term | Who / where | Example |
|------|-------------|---------|
| **Error** (mistake) | A person | Developer thinks discount starts at age 65, spec says 60 |
| **Defect** (bug, fault) | In the code/document | `if (age > 65)` |
| **Failure** | Visible when running | A 62-year-old customer doesn't get the discount |

Not every defect causes a failure. If no one aged 60–65 ever uses the app, the bug stays hidden.

## QA vs QC vs Testing
| | Focus | Example |
|--|-------|---------|
| **Quality Assurance (QA)** | The **process**, preventing defects | Code review rules, coding standards |
| **Quality Control (QC)** | The **product**, detecting defects | Inspecting the finished build |
| **Testing** | One QC activity | Running test cases |

## Verification vs Validation
- **Verification:** "Are we building the product **right**?" Does it match the spec?
- **Validation:** "Are we building the **right** product?" Does it solve the user's real problem?

An app can perfectly match a bad spec: it passes verification but fails validation.

## The 7 Testing Principles (ISTQB)
1. **Testing shows the presence of defects, not their absence.**
   Passing tests don't prove there are no bugs.
2. **Exhaustive testing is impossible.**
   A single 10-character text field has more combinations than you could ever test, so pick tests wisely (risk, techniques).
3. **Early testing saves time and money.**
   Test requirements and designs, not just code ("shift left").
4. **Defects cluster together.**
   A few modules usually contain most of the bugs (like the 80/20 rule), so focus there.
5. **Beware the pesticide paradox.**
   Running the same tests again and again stops finding new bugs, so update and add tests.
6. **Testing is context dependent.**
   A game and a banking app need very different testing.
7. **Absence-of-errors is a fallacy.**
   Bug-free software that users don't need is still a failure.

## Mindset of a tester
- **Curious:** "What happens if…?"
- **Skeptical, not negative.** Assume it might be broken and prove it works.
- **Detail-oriented:** exact steps, exact data, exact results.
- **User-focused:** think like a real (and confused, impatient, or malicious) user.
- **A good communicator.** Report the bug, not the person: "The button fails when…", not "You broke…".

## Check yourself
1. Give your own example of error → defect → failure.
2. Which principle explains why we can't test every input?
3. All 500 tests pass. Can you say the app has no bugs? Which principle?
4. What's the difference between verification and validation?
