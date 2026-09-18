# Test Data Management — Exercises

## Level 1 — Factories
1. Add a `country` field to `User`. Update the factory and run the tests. How many test files needed changes?
2. Add traits: `expiredTrialUser`, `userWithNoOrders`, `userWithApostropheName` (`O'Brien` — a classic bug source).
3. Write a `ProductFactory` and use it to build a 50-item catalogue.
4. Make `buildOrder` support `.withStatus('cancelled')` through the builder and assert the total is still computed.

## Level 2 — Isolation
5. Implement the **transaction rollback** strategy in `database.ts` and convert one describe block to use it.
6. Deliberately break isolation: create a shared user in `beforeAll` and mutate it in two tests. Show the failure, then fix it.
7. Write a `cleanupOlderThan(hours)` function for the "unique data, no cleanup" strategy and test it.
8. Run the suite with `--repeat-each=5` (or `--sequence.shuffle`). Does anything break? Fix what does.

## Level 3 — Data-driven
9. Move the checkout cases into a CSV and make the tests read both formats.
10. Generate a pairwise matrix for browser × OS × payment × currency. How many combinations does pairwise give you versus the full grid?
11. Install `fast-check` and write 2 property-based tests for `calculateTotal`.
12. Write a validation test for the data files: required columns present, no duplicate descriptions, statuses are valid numbers.

## Level 4 — Privacy
13. Extend `anonymizeUser` to handle addresses and dates of birth.
14. Write an anonymizer for a **support ticket free-text field** that strips emails, phone numbers and card numbers from the text.
15. Add a CI-style test that scans every file in `data/` and every fixture in the other project folders for PII.

## Level 5 — Integration with the rest of this repo
16. Use these factories in `04-Integration-Testing`: replace the inline task objects with a `buildTask` factory.
17. In `07-Playwright-UI-Automation`, create a user-data factory and use it for the checkout form (name, postcode variations).
18. Write your team's **test data strategy** document: sources, isolation, naming, privacy rules, environment reset process. One page.

## Quiz
1. Why do factories beat hardcoded objects?
2. What should a factory guarantee about the objects it returns?
3. Name 4 test data isolation strategies and when each works.
4. Why can seeded faker data cause UNIQUE violations in a shared database?
5. What makes pseudonymization different from anonymization under GDPR?
6. Why must pseudonymization be deterministic?
7. When would you use pairwise testing?

<details><summary>Answers</summary>

1. Defaults remove noise, the override shows intent, and schema changes are fixed in one place.
2. Valid by default, unique where uniqueness matters, derived values computed, overridable.
3. Fresh DB per test (unit/integration), transaction rollback (fast + isolated), truncate (single-threaded suites), track-and-delete or unique data (shared/parallel environments).
4. The same seed regenerates the same values in every test, so identity fields repeat.
5. Pseudonymized data can be re-identified with the key, so it's still personal data; anonymized data can't.
6. So relationships between tables/records stay consistent (referential integrity).
7. When combinations explode (browsers × OS × payment × locale) and testing everything is impossible.

</details>
