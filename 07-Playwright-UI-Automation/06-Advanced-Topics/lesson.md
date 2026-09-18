# Lesson 6 — Advanced Topics

📂 Code: `playwright-project/tests/06-advanced.spec.ts`

## 1. Network interception & mocking
Control what the browser receives from the server with `page.route(urlPattern, handler)`.

```ts
// Fake the response: no backend needed
await page.route('**/api/v1/fruits', (route) =>
  route.fulfill({ json: [{ id: 1, name: 'Mocked Mango' }] }));

// Change the real response
await page.route('**/api/v1/fruits', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  json.push({ id: 999, name: 'Extra Kiwi' });
  await route.fulfill({ response, json });
});

// Simulate errors / slow network
await page.route('**/api/orders', (route) => route.fulfill({ status: 500 }));
await page.route('**/api/orders', (route) => route.abort('failed'));

// Block things (images, analytics) to speed up tests
await page.route(/\.(png|jpg)$/, (route) => route.abort());
```

**Use mocking to test:** error messages (500, timeout), empty states, huge lists, and edge cases that are hard to create for real.
⚠️ Mocked tests don't prove the real backend works, so keep some un-mocked end-to-end tests too.

### Waiting for / checking network calls
```ts
const responsePromise = page.waitForResponse('**/api/cart');
await page.getByRole('button', { name: 'Add to cart' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

## 2. Authentication: log in once, reuse everywhere
Logging in through the UI in every test is slow. Save the **storage state** (cookies + localStorage) and reuse it.

**Recommended project setup:**
```ts
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```
```ts
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],   // runs setup first
  },
],
```
Add `playwright/.auth` to `.gitignore`, because it contains session tokens.
Even faster: log in with an **API call** in setup (`request.post('/api/login')`) instead of the UI.

## 3. Combining API + UI
```ts
test('order appears in history', async ({ request, page }) => {
  // Arrange via API: fast
  await request.post('/api/orders', { data: { item: 'Backpack' } });
  // Act + Assert via UI: what the user sees
  await page.goto('/orders');
  await expect(page.getByText('Backpack')).toBeVisible();
});
```
Use the API to **create test data** and the UI only for the part you're really testing.

## 4. Multiple browsers & devices
```ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  { name: 'mobile',   use: { ...devices['iPhone 15'] } },
]
```
`npx playwright install` downloads all the browsers. Run one with `--project=firefox`.

Other emulation options:
```ts
test.use({ viewport: { width: 375, height: 667 }, locale: 'de-DE', timezoneId: 'Europe/Berlin',
           geolocation: { latitude: 52.52, longitude: 13.4 }, permissions: ['geolocation'],
           colorScheme: 'dark' });
```

## 5. Multiple tabs & users
```ts
// Popup
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open' }).click();
const popup = await popupPromise;

// Two users at once (e.g. chat): two separate contexts
const alice = await browser.newContext();
const bob = await browser.newContext();
```

## 6. Screenshots & visual comparison
```ts
await page.screenshot({ path: 'page.png', fullPage: true });
await locator.screenshot({ path: 'card.png' });

await expect(page).toHaveScreenshot();   // compares to a saved baseline image
```
The first run of `toHaveScreenshot` creates the baseline. Update baselines with `--update-snapshots`.
(Covered in depth in `12-Visual-Regression-Testing`.)

## 7. Environment variables & secrets
Never hard-code real passwords:
```ts
await loginPage.login(process.env.APP_USER!, process.env.APP_PASS!);
```
```powershell
$env:APP_USER="standard_user"; $env:APP_PASS="secret_sauce"; npx playwright test
```
Or use a `.env` file with the `dotenv` package, and add `.env` to `.gitignore`.

## 8. Parallelism & sharding
- Files run in parallel by default; `fullyParallel: true` also parallelizes tests inside a file
- `workers: 4` controls how many run at once
- `test.describe.configure({ mode: 'serial' })` runs tests in order (avoid if possible)
- Big suites on CI: `npx playwright test --shard=1/4` splits across 4 machines

## 9. CI (GitHub Actions) preview
```yaml
- run: npm ci
- run: npx playwright install --with-deps
- run: npx playwright test
- uses: actions/upload-artifact@v4
  if: always()
  with: { name: playwright-report, path: playwright-report/ }
```
Full details in `14-CI-CD-for-Testing`.

## 10. Project structure for real work
```
tests/
  auth.setup.ts
  checkout/
    checkout.spec.ts
  login/
    login.spec.ts
pages/          ← page objects
fixtures/       ← custom fixtures
test-data/      ← JSON data files
utils/          ← helpers (random data, API helpers)
playwright.config.ts
.env            ← (gitignored)
```

## Try it
1. On https://demo.playwright.dev/api-mocking, mock the fruits API to return an **empty list** `[]`. What does the page show?
2. Convert the storage-state test into the recommended **setup project** pattern.
3. Uncomment `firefox` and `webkit` in the config, run `npx playwright install`, and run all tests on 3 browsers.
4. Run the saucedemo login test with an `iPhone 15` device.
