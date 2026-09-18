# Lesson 5 — Code Coverage and Writing Good Tests

## Code coverage
```powershell
npm run coverage        # open coverage/index.html for a colored line-by-line view
```
| Metric | Question |
|--------|----------|
| **Statements / Lines** | Was each line executed? |
| **Branches** | Was each side of every `if`, `? :`, `&&`, `\|\|` executed? |
| **Functions** | Was each function called? |

### ⚠️ Coverage lies
```ts
function divide(a, b) { return a / b; }
it('divides', () => { divide(10, 2); });   // 100% coverage, ZERO assertions!
```
Coverage tells you **what was executed**, not **what was verified**.
- **Low coverage** is a useful signal: untested code definitely exists
- **High coverage** does not mean good tests
- Typical team targets: 70–90% line coverage, with more focus on branch coverage for critical logic
- Chasing 100% often leads to useless tests of trivial code

Enforce a minimum in `vitest.config.ts`:
```ts
coverage: { thresholds: { lines: 80, branches: 80 } }
```

## Mutation testing: testing your tests
A tool changes your code slightly (a **mutant**): `>` → `>=`, `+` → `-`, `true` → `false`, or deletes a line.
Then it runs your tests:
- A test fails → mutant **killed** ✅ (your tests noticed)
- All tests pass → mutant **survived** ❌ (your tests are weak there)

Tool for JS/TS: **Stryker** (`npx stryker init`). The mutation score is a much more honest metric than coverage.

## Test smells (bad signs)
| Smell | Example | Fix |
|-------|---------|-----|
| **No assertion** | calls code, never `expect`s | add real checks |
| **Testing implementation** | asserts private fields or the exact internal call order | test public behavior/output |
| **Logic in tests** | `if`/`for` computing the expected value | hard-code expected values |
| **Mystery guest** | depends on a file/DB/env var you can't see | make the data explicit in the test |
| **Shared mutable state** | tests pass alone, fail together | `beforeEach` with fresh objects |
| **Over-mocking** | 8 mocks for one test | test at a higher level, or redesign |
| **Flaky** | uses real time, random, network | fake timers, stubs |
| **Giant test** | 50 lines, 20 expects, many behaviors | split into focused tests |
| **Commented-out tests** | `// it('...')` | fix it or delete it (or `it.todo`) |
| **Copy-paste tests** | 10 near-identical tests | `it.each` |

## Don't re-implement the logic in the test
```ts
// ❌ If the formula is wrong in the code, it's wrong in the test too → passes
expect(total(items)).toBe(items.reduce((s, i) => s + i.price * i.qty, 0) * 0.9);

// ✅ Concrete, hand-calculated expectation
expect(total(items)).toBe(47.25);
```

## What makes a great unit test?
1. **Fails for exactly one reason**, and the name tells you what broke
2. **Readable** as documentation of the behavior
3. **Survives refactoring:** tests behavior, not internals
4. **Fast and deterministic**
5. **Would catch a real bug** (ask: "what mutation would this test kill?")

## Unit tests in the bigger picture
- Unit tests prove the pieces work, **not** that they work together → `04-Integration-Testing`
- They run on every commit in CI → `14-CI-CD-for-Testing`
- They're the cheapest place to test edge cases. Don't push every boundary value up into slow UI tests.

## Try it
1. Run coverage and open `coverage/index.html`. Find the one uncovered function.
2. Delete the `expect` line from `adds an item`. Does coverage change? (No! That's the lesson.)
3. In `cart.ts`, change `item.quantity <= 0` to `item.quantity < 0`. Does any test fail? Now change `price < 0` to `price <= 0`. Which tests catch which mutation?
4. Add a coverage threshold of 95% for functions and watch the run fail.
