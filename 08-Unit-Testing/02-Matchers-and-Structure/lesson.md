# Lesson 2 — Structure, Hooks, Matchers, Parameterized Tests

📂 Code: `unit-project/tests/02-cart.test.ts`, `03-password.test.ts`

## Organizing with `describe`
```ts
describe('Cart', () => {
  describe('adding items', () => { it(...); it(...); });
  describe('totals', () => { it(...); });
});
```
Output reads like a specification:
```
✓ Cart > adding items > merges quantity when the same sku is added twice
```

## Hooks
```ts
beforeAll(() => {});   // once before all tests in this describe
beforeEach(() => {});  // before EACH test ← most used
afterEach(() => {});   // cleanup after each
afterAll(() => {});    // once at the end
```
```ts
let cart: Cart;
beforeEach(() => { cart = new Cart(); });   // fresh object → independent tests
```
❌ Don't create one `const cart = new Cart()` at the top that all tests modify. Tests would then depend on execution order.

## Matchers cheat sheet
| Matcher | Use for |
|---------|---------|
| `toBe(x)` | primitives (numbers, strings, booleans), same object reference |
| `toEqual(obj)` | deep equality of objects/arrays |
| `toStrictEqual(obj)` | like toEqual, but also checks `undefined` props and class types |
| `toMatchObject(partial)` | object contains at least these props |
| `toContain(item)` | array contains item / string contains substring |
| `toContainEqual(obj)` | array contains an object deeply equal to obj |
| `toHaveLength(n)` | arrays, strings |
| `toHaveProperty('a.b', val)` | nested property |
| `toMatch(/regex/)` | strings |
| `toBeTruthy()` / `toBeFalsy()` | loose true/false |
| `toBeNull()` / `toBeUndefined()` / `toBeDefined()` | |
| `toBeGreaterThan(n)` / `toBeLessThanOrEqual(n)` | numbers |
| `toBeCloseTo(n, digits)` | decimals |
| `toThrow('msg' \| /regex/)` | errors |
| `.not.` | negate anything |

### Asymmetric matchers (flexible values inside objects)
```ts
expect(user).toEqual({
  id: expect.any(Number),
  email: expect.stringContaining('@'),
  createdAt: expect.any(String),
  roles: expect.arrayContaining(['user']),
});
```

### `toBe` vs `toEqual`
```ts
expect({ a: 1 }).toBe({ a: 1 });     // ❌ fails: different objects in memory
expect({ a: 1 }).toEqual({ a: 1 });  // ✅
```

## Parameterized tests (`test.each`)
Same logic, many inputs. This is perfect for **boundary values**:
```ts
it.each([
  { length: 7,  valid: false },
  { length: 8,  valid: true },
  { length: 20, valid: true },
  { length: 21, valid: false },
])('length $length → valid: $valid', ({ length, valid }) => { ... });
```
Or array form: `it.each([[0, true], [1, false]])('isEven(%i) → %s', (n, exp) => ...)`

## Focus and skip
```ts
it.only('run just this', ...);   // ⚠️ don't commit
it.skip('later', ...);
it.todo('handle unicode passwords');   // reminder that shows in output
```

## Naming tests
Describe **behavior**, not implementation:
- ❌ `test1`, `testAddItem`, `should work`
- ✅ `merges quantity when the same sku is added twice`
- ✅ `rejects an unknown coupon and keeps the total`

Pattern: **[does what] when [condition]**

## One behavior per test
```ts
// ❌ If the first expect fails, you never learn about the rest
it('cart works', () => { /* add, remove, coupon, total… 15 expects */ });

// ✅ Multiple expects are fine when they check ONE behavior
it('adds an item', () => {
  cart.addItem(mug);
  expect(cart.getItems()).toHaveLength(1);
  expect(cart.getItems()[0]).toEqual(mug);
});
```

## Try it
1. Add a test: adding the same sku with a **different price**. What happens? What *should* happen? Write the test for the behavior you think is right.
2. Add `it.each` cases for coupons with spaces: `' SAVE10 '`. Does it work? (That's a bug you've just found!)
3. Add a `test.todo` list of 5 cart cases you haven't covered.
