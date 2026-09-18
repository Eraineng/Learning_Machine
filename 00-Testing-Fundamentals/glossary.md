# Testing Glossary

| Term | Meaning |
|------|---------|
| **Acceptance criteria** | Conditions a feature must meet to be accepted ("Given… When… Then…") |
| **Acceptance testing (UAT)** | Users/business check the system meets their needs |
| **Assertion** | A check in automated test code: `expect(x).toBe(5)` |
| **Black-box testing** | Testing by inputs/outputs without looking at the code |
| **Boundary value analysis (BVA)** | Testing at the edges of valid ranges (min-1, min, max, max+1) |
| **Bug / Defect** | A flaw in the product that can cause it to behave incorrectly |
| **Coverage** | How much of something (code, requirements) is exercised by tests |
| **Decision table** | Table of condition combinations → expected actions |
| **Defect life cycle** | New → Assigned → Fixed → Retest → Closed (or Reopened) |
| **E2E (end-to-end) test** | Tests a full user journey through the whole system |
| **Environment** | Where tests run: dev, QA/test, staging, production |
| **Equivalence partitioning (EP)** | Grouping inputs that should behave the same; test one per group |
| **Error** | A human mistake (e.g. developer misreads the requirement) |
| **Expected result** | What should happen, according to requirements |
| **Actual result** | What really happened |
| **Exploratory testing** | Learning, designing and testing at the same time, without a script |
| **Failure** | The visible wrong behavior when a defect is executed |
| **Flaky test** | Test that sometimes passes, sometimes fails, without code changes |
| **Functional testing** | Does the feature do *what* it should? |
| **Integration testing** | Testing that components work together |
| **Mock / Stub** | Fake replacement for a real dependency in a test |
| **Negative testing** | Testing with invalid input to make sure it's handled well |
| **Non-functional testing** | *How well* it works: speed, security, usability… |
| **Positive testing** | Testing with valid input, the "happy path" |
| **Precondition** | What must be true before a test starts (e.g. user is logged in) |
| **Priority** | How soon a bug should be fixed (business decision) |
| **Regression testing** | Re-testing to make sure changes didn't break existing features |
| **Requirement** | A description of what the system must do |
| **Sanity testing** | Quick, narrow check that a specific fix/feature works |
| **Severity** | How much damage a bug does (technical impact) |
| **Smoke testing** | Quick, broad check that the build's main functions work at all |
| **SDLC** | Software Development Life Cycle |
| **STLC** | Software Testing Life Cycle |
| **System testing** | Testing the complete, integrated system against requirements |
| **Test case** | Steps + data + expected result to verify one thing |
| **Test plan** | Document describing scope, approach, resources, schedule of testing |
| **Test pyramid** | Many unit tests, fewer integration, fewest UI/E2E tests |
| **Test scenario** | A high-level "what to test" (one scenario → many test cases) |
| **Test suite** | A group of test cases |
| **Traceability matrix** | Maps requirements ↔ test cases to show coverage |
| **Unit testing** | Testing the smallest pieces (functions/classes) in isolation |
| **Verification** | "Are we building the product right?" (reviews, specs) |
| **Validation** | "Are we building the right product?" (does it meet user needs) |
| **White-box testing** | Testing with knowledge of the internal code |
