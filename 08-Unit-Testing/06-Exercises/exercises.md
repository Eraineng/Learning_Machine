# Unit Testing — Exercises

Code: `unit-project/src/exercises/` · Tests: `unit-project/tests/exercises/`

## Level 1 — Test existing code
1. **math.ts:** write 5 new tests for `divide`: negative numbers, decimals, `divide(0, 5)`, very large numbers, and `divide(1, 3)` with `toBeCloseTo`.
2. **password.ts:** the rules say 8–20 characters. Test exactly **8 spaces + "A1"** combos. Does the "No spaces" rule interact correctly with length?
3. **cart.ts:** find at least **2 bugs or unclear behaviors** by writing tests (hints: coupon with spaces, same sku with a different price, applying two coupons, removing a sku that isn't in the cart).

## Level 2 — Write code + tests
4. `slugify(title)`: `"Hello World!"` → `"hello-world"`. Handle multiple spaces, leading/trailing spaces, accented letters (`"Café"` → `"cafe"`) and an empty string.
5. `isValidEmail(email)`: design the test cases **first** using equivalence partitions, then implement.
6. `calculateShipping(weightKg, country)`: < 1kg $5, 1–5kg $10, > 5kg $20; international ×2; weight ≤ 0 throws. Use `it.each` with **boundary values**.

## Level 3 — Mocks
7. `WeatherService.getAdvice(city)` calls an injected `weatherApi.getTemp(city)`:
   - < 10°C → "Wear a coat", 10–25 → "Nice day", > 25 → "Stay hydrated"
   - API error → "Weather unavailable"
   - results cached for 10 minutes (test with **fake timers** that the API is called only once, and again after 10 min)
8. `PasswordResetService.requestReset(email)`:
   - looks up the user via `userRepo.findByEmail`
   - if found → generate a token (inject a token generator) and call `mailer.send`
   - if **not** found → do **not** send email, but return the same success message (security: don't reveal which emails exist)
   - verify all interactions with `toHaveBeenCalledWith` / `not.toHaveBeenCalled`

## Level 4 — TDD katas (strict Red → Green → Refactor)
9. FizzBuzz
10. Roman numerals
11. String Calculator (full rules in `04-TDD/lesson.md`)
12. **Bowling score** kata: `game.roll(pins)`, `game.score()`, including spares, strikes and a perfect game = 300

## Level 5 — Quality
13. Get `src/exercises` to ≥ 90% branch coverage.
14. Install Stryker (`npx stryker init`), run it on `cart.ts`, and kill every surviving mutant by improving tests.
15. Review a teammate's (or an AI-generated) test file and list its test smells using the table in lesson 5.

## Quiz yourself
1. What's the difference between a stub and a mock?
2. Why does `expect(() => fn()).toThrow()` need the arrow function?
3. What does 100% coverage NOT guarantee?
4. Name the three TDD steps.
5. What does FIRST stand for?
6. When should you use `toEqual` instead of `toBe`?
7. A test passes alone but fails when run with others. Most likely cause?
8. Where should you mock: at boundaries, or everywhere?

<details><summary>Answers</summary>

1. A stub only returns canned data; a mock is also used to **verify interactions** (was it called, and with what arguments).
2. Otherwise the function runs (and throws) before `expect` receives anything.
3. That the behavior was actually **verified** (assertions), or that the logic is correct.
4. Red → Green → Refactor.
5. Fast, Independent, Repeatable, Self-validating, Timely.
6. For objects/arrays (deep equality); `toBe` checks identity/primitive equality.
7. Shared mutable state between tests (they aren't independent).
8. At boundaries: network, DB, file system, time, randomness, third-party services.

</details>
