# Lesson 3 — Data-Driven Testing

📂 Code: `data-project/tests/03-data-driven.test.ts`, `data/*`

## Idea
One test body, many data rows. Adding a case = adding a row, not writing code.
```ts
it.each(checkoutCases)('$case → $expectedTotal', ({ items, coupon, expectedTotal }) => {
  expect(calculateTotal(items, coupon)).toBe(expectedTotal);
});
```

## Where the data lives
| Location | Good for |
|----------|----------|
| **Inline array** | A handful of cases, close to the test |
| **JSON file** | Structured cases, nested objects, shared between suites |
| **CSV file** | Long flat tables; business analysts/manual testers can edit them |
| **Database / API** | Cases generated from real usage or a test management tool |
| **Generated** | Combinatorial or property-based testing |

## Naming matters
```ts
it.each(cases)('$description → $expectedStatus', ...)
```
Every generated test must have a **unique, descriptive name**, or a failing run tells you nothing.
Vitest/Jest support `$property`, `%s`, `%i`, `%j` in titles.

## Parsing CSV: the classic traps
Our `splitCsvLine` handles a real one: `"user,with,commas"` must stay a single field.
Others to watch: BOM at the start of the file, `\r\n` line endings (Windows!), quoted newlines,
empty trailing fields, numbers read as strings (`expectedStatus` is `"200"`, not `200`).
For production use a library (`papaparse`, `csv-parse`) instead of hand-rolling.

## Combinatorial explosion and pairwise testing
3 browsers × 4 OS × 5 payment methods × 2 currencies = 240 combinations. You can't run them all.
**Pairwise (all-pairs) testing**: cover every *pair* of values at least once — typically ~20 tests instead of 240,
and studies suggest most defects come from single values or pairs.
Tools: PICT (Microsoft), `allpairspy`, pairwise generators online. (More in folder 15.)

```ts
// Generate the full grid, then reduce with a pairwise tool
const grid = browsers.flatMap(b => os.flatMap(o => payments.map(p => ({ b, o, p }))));
```

## Property-based testing (bonus technique)
Instead of examples, describe a **property** and let a tool generate hundreds of inputs:
```ts
import fc from 'fast-check';
fc.assert(fc.property(fc.array(fc.nat()), (arr) => {
  expect(sort(sort(arr))).toEqual(sort(arr));     // sorting twice = sorting once
}));
```
It finds inputs humans never think of (empty arrays, huge numbers, duplicate values) and **shrinks** a failing
case to the smallest reproduction. Libraries: `fast-check` (JS), Hypothesis (Python), jqwik (Java).

## Keeping data-driven tests healthy
- ✅ Keep the expected value **in the data**, not computed by the test
- ✅ One row = one clear scenario, with a description column
- ✅ Validate the data file itself (our test asserts the row count and parsing)
- ❌ Don't put logic (`if`) inside the test body for special rows — split into separate tests instead
- ❌ Don't let the file grow to 500 near-identical rows; use equivalence partitioning (folder 00)

## Try it
1. Add 3 rows to `checkout-cases.json`, including a negative quantity. Does the code handle it?
2. Add a `currency` column to the CSV and extend the parser and test.
3. Break the CSV on purpose (remove a closing quote). What happens? Add a validation test.
4. Install `fast-check` and write a property test for `calculateTotal`: the total must never be negative, and a coupon must never increase it.
