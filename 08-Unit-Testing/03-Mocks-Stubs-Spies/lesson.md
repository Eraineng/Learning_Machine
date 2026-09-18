# Lesson 3 — Test Doubles: Mocks, Stubs, Spies, Fakes

📂 Code: `unit-project/tests/04-mocks.test.ts`, `05-async.test.ts`

## The problem
```ts
class OrderService {
  async placeOrder(order) {
    await paymentGateway.charge(...);   // real credit card charge 💸
    await emailSender.send(...);        // real email 📧
  }
}
```
A unit test must not charge cards or send emails. It should be **fast, isolated and repeatable**.
So we replace the dependencies with **test doubles** (named after stunt doubles in movies).

## Types of test doubles
| Type | What it does | Example |
|------|--------------|---------|
| **Dummy** | Passed in but never used | `new Service(null as any)` |
| **Stub** | Returns canned answers | `charge` always returns `{ success: true }` |
| **Spy** | Records calls; may keep the real behavior | "was `log` called with 'hi'?" |
| **Mock** | Pre-programmed + you **verify the interactions** | "charge was called once with (50, 'tok_123')" |
| **Fake** | Working, lightweight implementation | in-memory database instead of PostgreSQL |

In practice, people say "mock" for most of these. Vitest's `vi.fn()` can act as a stub, spy or mock.

## Dependency injection makes mocking easy
```ts
class OrderService {
  constructor(private payment: PaymentGateway, private email: EmailSender) {}
}
// production
new OrderService(new StripeGateway(), new SmtpSender());
// test
new OrderService({ charge: vi.fn() }, { send: vi.fn() });
```

## `vi.fn()`
```ts
const charge = vi.fn();                                  // returns undefined
charge.mockReturnValue(42);                              // sync stub
charge.mockResolvedValue({ success: true });             // async stub (Promise resolves)
charge.mockRejectedValue(new Error('timeout'));          // async failure
charge.mockResolvedValueOnce(a).mockResolvedValueOnce(b); // different answer per call
charge.mockImplementation((amount) => amount > 100 ? fail : ok);
```

### Verifying calls
```ts
expect(charge).toHaveBeenCalled();
expect(charge).toHaveBeenCalledOnce();
expect(charge).toHaveBeenCalledTimes(3);
expect(charge).toHaveBeenCalledWith(50, 'tok_123');
expect(charge).toHaveBeenLastCalledWith(...);
expect(charge).not.toHaveBeenCalled();
charge.mock.calls        // [[50, 'tok_123'], ...]: all arguments
```

## Spies: `vi.spyOn`
```ts
const spy = vi.spyOn(logger, 'log');                       // watches, real code runs
vi.spyOn(Math, 'random').mockReturnValue(0.42);            // replaces behavior
afterEach(() => vi.restoreAllMocks());                     // ⚠️ always restore
```

## Mocking whole modules
```ts
vi.mock('../src/emailClient', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));
```
Useful when code imports a dependency directly instead of receiving it.

## Controlling time: fake timers
```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

scheduleReminder(callback, 5);
vi.advanceTimersByTime(5 * 60_000);   // 5 minutes pass instantly
expect(callback).toHaveBeenCalled();

vi.setSystemTime(new Date('2030-01-01'));   // freeze "now"
```
An alternative is to inject a clock: `constructor(..., private now = () => new Date())`, as `OrderService` does.

## Async tests
```ts
it('resolves', async () => {
  await expect(getUserName(1, fetch)).resolves.toBe('Ann Tester');
});
it('rejects', async () => {
  await expect(getUserName(99, fetch)).rejects.toThrow('not found');
});
```
⚠️ **Always `await`** async assertions. Without `await`, the test finishes before the promise does and may **falsely pass**.

## When NOT to mock
- ❌ Don't mock the thing you're testing
- ❌ Don't mock simple value objects or pure functions
- ❌ Too many mocks lead to tests that only check "the code calls what the code calls". They break on every refactor and catch no real bugs.
- ✅ Mock at **boundaries**: network, database, file system, time, randomness, third-party services

> "Mock roles, not objects." If a test needs 8 mocks, the class probably does too much.

## Try it
1. Add a test: payment succeeds but **sending the email throws**. What does `placeOrder` do? Is the customer charged without confirmation? Write down whether that's a bug.
2. Use `mockImplementation` so `charge` fails for amounts over 1000, and test both sides.
3. Check `charge.mock.calls` and assert the exact arguments of the 2nd call in a test that places 2 orders.
4. Coverage shows `orderService.ts` functions at 66%. Which function is never called in tests, and why? (Hint: the default value of `now`.)
