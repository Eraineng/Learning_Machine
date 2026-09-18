# Test Data Management — Learning Roadmap

Bad test data is the #1 source of flaky, unmaintainable test suites:
"it passed yesterday", "it only fails in CI", "someone deleted my user", "we can't run tests in parallel".

```
data-project/
├── src/
│   ├── factories.ts    build objects with defaults, traits and a builder (faker)
│   ├── database.ts     seeding + 4 cleanup strategies
│   └── anonymize.ts    GDPR-safe anonymization, masking, PII detection
├── data/
│   ├── checkout-cases.json    data-driven test cases
│   └── login-cases.csv        CSV cases (with quoted commas + unicode)
└── tests/  01-factories · 02-seeding-cleanup · 03-data-driven · 04-anonymization
```

## Setup
```powershell
cd data-project
npm install
npm test
```

## Checklist
- [ ] `01-Test-Data-Strategies/lesson.md`: where test data comes from, isolation, the trade-offs
- [ ] `02-Factories-and-Builders/lesson.md`: factories, traits, builders, faker, seeding
- [ ] `03-Data-Driven-Testing/lesson.md`: JSON/CSV-driven cases, combinatorial data
- [ ] `04-Privacy-and-Anonymization/lesson.md`: GDPR, anonymization, masking, synthetic data
- [ ] `05-Exercises/exercises.md`
