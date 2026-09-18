# Lesson 1 — Unit Testing Basics

📂 Code: `unit-project/tests/01-basics.test.ts`

## What is a "unit"?
The **smallest testable piece** of code: usually one function, or one class and its methods.
A unit test checks that piece **in isolation**, with no real database, network, file system or browser.

| | Unit test | API test (01) | UI test (02) |
|--|-----------|---------------|--------------|
| Tests | one function | one endpoint | a user journey |
| Speed | ~1 ms | ~100 ms | ~2 s |
| Needs server/browser | ❌ | server | server + browser |
| When it fails, you know | the exact function | which endpoint | "something in the flow" |
| Written by | usually developers | devs/QA | usually QA |

**Why should testers learn unit testing?**
- You'll review developers' tests and spot missing cases
- SDET / automation engineer jobs expect it
- It's the easiest place to learn assertions, mocks and test design

## Anatomy of a unit test
```ts
import { describe, it, expect } from 'vitest';
import { add } from '../src/math';

describe('add', () => {                    // group: the unit being tested
  it('adds two positive numbers', () => {  // one behavior
    // Arrange: set up inputs
    const a = 2, b = 3;
    // Act: call the code
    const result = add(a, b);
    // Assert: check the output
    expect(result).toBe(5);
  });
});
```
`it` and `test` are the same thing. `it` reads nicely: "it adds two positive numbers".

## AAA: Arrange, Act, Assert
Every test has these 3 parts. Keep them visually separate, and keep **one Act per test**.

## FIRST: properties of good unit tests
| Letter | Meaning | Breaks when… |
|--------|---------|--------------|
| **F**ast | Milliseconds | calling real APIs/DBs |
| **I**ndependent | No test depends on another | shared variables modified between tests |
| **R**epeatable | Same result every time, anywhere | using real dates, random values, network |
| **S**elf-validating | Pass/fail automatically | "check the console output manually" |
| **T**imely | Written with (or before) the code | tests added months later |

## What to test in a function
Use your test design skills from folder 00:
- ✅ **Happy path:** normal input
- ✅ **Edge values:** 0, empty string, empty array, min/max
- ✅ **Negative / invalid input:** should it throw?
- ✅ **Each branch:** every `if`/`else`
- ✅ **Special values:** `null`, `undefined`, negative numbers, `NaN`, very large numbers

## Testing errors
```ts
expect(() => divide(1, 0)).toThrow('Cannot divide by zero');
//     ^^^^^ wrap in a function! Otherwise the error is thrown before expect() can catch it
```

## Floating-point trap
```ts
0.1 + 0.2 === 0.3            // false! (0.30000000000000004)
expect(0.1 + 0.2).toBeCloseTo(0.3);   // ✅
```
Money calculations are a classic source of real bugs, and a classic unit test target.

## Pure functions are easiest to test
A **pure function** always returns the same output for the same input and has no side effects.
```ts
function add(a, b) { return a + b; }                 // pure ✅ easy
function addToDb(a, b) { db.save(a + b); }           // side effect ❌ needs mocks
function greet() { return `Hi at ${new Date()}`; }   // depends on time ❌ needs control
```
Code that's hard to test is often a sign of design problems. Unit testing pushes developers toward cleaner code.

## Try it
1. Run `npm run test:watch`. Change `toBe(5)` to `toBe(6)` and watch it fail instantly. Change it back.
2. Add tests for `isEven` with a large number (`1_000_000`) and a decimal (`2.5`). What does `isEven(2.5)` return? Is that a bug?
3. Write a test for `roundMoney(1.005)`. Is the result what a user expects? (Search for "JavaScript rounding 1.005".)
