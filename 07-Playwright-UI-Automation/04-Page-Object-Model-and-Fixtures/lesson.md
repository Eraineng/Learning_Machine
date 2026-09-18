# Lesson 4 — Page Object Model, Hooks and Fixtures

📂 Code: `playwright-project/pages/*` · `tests/04-page-objects.spec.ts` · `tests/05-fixtures.spec.ts`

## The problem
You have 50 tests that all log in with:
```ts
await page.getByPlaceholder('Username').fill('standard_user');
```
Then the developer renames the placeholder to "Email", and you have to edit 50 files. 😱

## Page Object Model (POM)
Put each page's **locators and actions** in one class. Tests call methods instead.

```ts
// pages/LoginPage.ts
export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() { await this.page.goto('/'); }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}
```
```ts
// test
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('standard_user', 'secret_sauce');
```
Now the placeholder change is **one edit** in one file.

### POM guidelines
- ✅ One class per page (or per big component, like a header or modal)
- ✅ Locators as properties, user actions as methods (`login`, `addToCart`)
- ✅ Method names describe **what the user does**, not HTML details
- ⚠️ Keep most `expect` calls **in the tests**, so readers can see what's being verified. Small reusable checks like `expectError()` are fine.
- ❌ Don't create one giant "BasePage" with everything in it

## Hooks
```ts
test.beforeAll(async () => { /* once, before all tests in the file/describe */ });
test.beforeEach(async ({ page }) => { /* before EACH test */ });
test.afterEach(async ({ page }) => { /* after each, e.g. cleanup */ });
test.afterAll(async () => { /* once, at the end */ });

test.describe('Cart', () => {       // group related tests
  test.beforeEach(...);             // only applies inside this group
  test('...', ...);
});
```

## Annotations
```ts
test.skip('not ready yet', ...);
test.only('run just this one', ...);   // ⚠️ never commit this!
test.fixme('known broken', ...);
test.slow();                           // triples the timeout
test('login @smoke', ...);             // tag, then run: npx playwright test --grep @smoke
```

## Data-driven tests
Run the same test with different data:
```ts
const cases = [
  { user: '', pass: 'x', error: 'Username is required' },
  { user: 'a', pass: '', error: 'Password is required' },
];
for (const c of cases) {
  test(`login error: ${c.error}`, async ({ page }) => { /* ... */ });
}
```
Test names must be **unique**, which is why the data goes into the name.

## Fixtures: Playwright's superpower
You've already used built-in fixtures: `page`, `request`, `browser`, `context`.
A fixture is "something a test needs", which Playwright **sets up before** and **cleans up after**.

Create your own:
```ts
// pages/fixtures.ts
export const test = base.extend<{ inventoryPage: InventoryPage }>({
  inventoryPage: async ({ page }, use) => {
    // setup
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');

    await use(new InventoryPage(page));   // ← test runs here

    // teardown (optional), runs after the test
  },
});
```
```ts
// test: just ask for it, already logged in!
import { test, expect } from '../pages/fixtures';

test('sort by price', async ({ inventoryPage }) => {
  await inventoryPage.sortBy('Price (low to high)');
});
```

| | Hooks (`beforeEach`) | Fixtures |
|--|----------------------|----------|
| Reuse across files | ❌ copy-paste | ✅ import |
| Only runs if needed | ❌ always runs | ✅ only when a test asks for it |
| Setup + teardown together | ❌ split in two places | ✅ one function |

## Try it
1. Create `pages/MenuPage.ts` with a `logout()` method (open the menu, click Logout). Use it in a new test.
2. Add a `cartPage` method `removeItem(name)` and test it.
3. Add a fixture `cartWithBackpack` that logs in, adds the backpack, and opens the cart.
4. Make a data-driven test that adds each of 3 products and checks the badge count goes 1 → 2 → 3.
