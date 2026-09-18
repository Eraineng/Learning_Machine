# Lesson 4 — Test-Driven Development (TDD)

## The cycle
```
   ┌──────────► 🔴 RED ──────────┐
   │   write a failing test       │
   │                              ▼
🔵 REFACTOR                   🟢 GREEN
clean up code               write the MINIMUM
(tests stay green)          code to pass
   ▲                              │
   └──────────────────────────────┘
```
1. **Red:** write a small test for the next behavior. Run it and **watch it fail** (this proves the test can fail).
2. **Green:** write the simplest code that makes it pass. Cheating is allowed!
3. **Refactor:** improve names and remove duplication. Tests must stay green.
4. Repeat, in small steps (minutes, not hours).

## Worked example: `fizzBuzz(n)`
Rules: multiples of 3 → "Fizz", of 5 → "Buzz", of both → "FizzBuzz", otherwise the number as a string.

**Cycle 1: Red**
```ts
it('returns "1" for 1', () => { expect(fizzBuzz(1)).toBe('1'); });
// ❌ fizzBuzz is not defined
```
**Green**
```ts
export function fizzBuzz(n: number) { return '1'; }   // yes, really
```
**Cycle 2: Red**
```ts
it('returns "2" for 2', () => { expect(fizzBuzz(2)).toBe('2'); });  // ❌
```
**Green**
```ts
export function fizzBuzz(n: number) { return String(n); }
```
**Cycle 3: Red**
```ts
it('returns "Fizz" for 3', () => { expect(fizzBuzz(3)).toBe('Fizz'); });  // ❌
```
**Green**
```ts
export function fizzBuzz(n: number) {
  if (n % 3 === 0) return 'Fizz';
  return String(n);
}
```
**Cycle 4:** 5 → "Buzz". **Cycle 5:** 15 → "FizzBuzz" (does the order of your `if`s matter? The test will tell you!)
**Refactor:** convert to `it.each` and tidy the code.

## Why TDD?
- ✅ Every line of code is covered by a test from the start
- ✅ It forces you to think about **requirements and edge cases first**, which is a tester mindset!
- ✅ It leads to small, testable, loosely coupled designs
- ✅ You can refactor fearlessly
- ⚠️ It feels slower at first; the payoff is fewer bugs and less debugging
- ⚠️ It's harder for UI layouts and exploratory prototypes

## BDD: Behavior-Driven Development
BDD is TDD with a shared, business-readable language (**Gherkin**):
```gherkin
Feature: Shopping cart coupons
  Scenario: Valid coupon reduces the total
    Given a cart with items totaling $52.50
    When I apply the coupon "SAVE10"
    Then the total should be $47.25
```
Product owners, developers and testers write scenarios **together before coding** ("Three Amigos").
Tools: Cucumber, playwright-bdd, SpecFlow. In unit tests you can mirror the style:
```ts
describe('given a cart with $52.50', () => {
  describe('when coupon SAVE10 is applied', () => {
    it('then total is $47.25', ...);
  });
});
```

## Try it (the most important exercise in this folder)
Do these with strict TDD. Commit (or copy) your code after every green step so you can see the progression.
1. `fizzBuzz(n)` as above → `src/exercises/fizzBuzz.ts` + `tests/exercises/fizzBuzz.test.ts`
2. `romanNumeral(n)`: 1 → "I", 4 → "IV", 9 → "IX", 14 → "XIV", 2026 → "MMXXVI"
3. `StringCalculator.add("1,2")` → 3 (the classic kata):
   - `""` → 0, `"5"` → 5, `"1,2,3"` → 6
   - newlines as separators too: `"1\n2,3"` → 6
   - negative numbers throw `"negatives not allowed: -1, -4"`
   - numbers > 1000 are ignored
