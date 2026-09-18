# Lesson 1 — Setup and Your First UI Test

## What is Playwright?
Playwright is a free tool from Microsoft that **controls real browsers with code**. It opens pages, clicks, types, and checks what's on screen, just like a user would.

- Runs **Chromium** (Chrome/Edge), **Firefox** and **WebKit** (Safari)
- Built-in test runner, assertions, reports, screenshots, videos and traces
- **Auto-waits** for elements, so tests are far less flaky than older tools like Selenium
- Tests are written in TypeScript/JavaScript (Python, Java and .NET versions also exist)

## Setup
Open a terminal in `playwright-project/`:
```powershell
npm install                        # installs @playwright/test
npx playwright install chromium    # downloads the browser (~300 MB, one time)
```
Starting a brand-new project somewhere else? Use `npm init playwright@latest`, which creates everything for you.

**VS Code:** install the **Playwright Test for VSCode** extension (by Microsoft). You get ▶ buttons next to each test, a test explorer, and "Pick locator".

## Running tests
```powershell
npx playwright test                              # all tests, headless (no window)
npx playwright test --headed                     # watch the browser
npx playwright test tests/01-first-test.spec.ts  # one file
npx playwright test -g "user can log in"         # tests whose name matches
npx playwright test --project=chromium           # one browser
npx playwright test --ui                         # UI mode, the best way to learn
npx playwright show-report                       # open the HTML report
```

## Your first test, line by line
```ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {        // `page` = a fresh browser tab
  await page.goto('/');                               // open baseURL from config

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory\.html/);    // check URL
  await expect(page.getByText('Products')).toBeVisible();
});
```

Every UI test follows the same pattern: **Arrange → Act → Assert**.
1. **Arrange:** go to the page and get into the right state
2. **Act:** do something, like a click or typing
3. **Assert:** check the result with `expect`

### Why `await` everywhere?
Browser actions take time. `await` means "wait until this finishes before the next line".
**Forgetting `await` is the #1 beginner bug.** The test runs ahead and fails randomly.

### Test isolation
Each test gets a **brand-new browser context**, like a fresh incognito window with no cookies and no login.
Tests never affect each other, which means they can run **in parallel**.

## The config file (`playwright.config.ts`)
| Setting | What it does |
|---------|--------------|
| `testDir` | Where test files live |
| `baseURL` | So you can write `page.goto('/')` instead of the full URL |
| `timeout` | Max time per test |
| `retries` | Retry failed tests (useful in CI) |
| `use.screenshot / video / trace` | Evidence captured when a test fails |
| `use.testIdAttribute` | Which attribute `getByTestId` uses |
| `projects` | Which browsers/devices to run on |

## API test vs UI test: what changed?
| API test (folder 01) | UI test (this folder) |
|----------------------|-----------------------|
| `async ({ request })` | `async ({ page })` |
| `request.get('/posts/1')` | `page.goto('/')` |
| check status + JSON | check what's **visible** on the page |
| milliseconds | seconds |

## Try it
1. Run `npx playwright test tests/01-first-test.spec.ts --headed`. Watch it log in.
2. Run `npx playwright show-report` and click into a test to see each step.
3. Change `'Products'` to `'Productz'`, run it, and read the error. Change it back.
4. Add a test: log in as `standard_user` and check the page title is `Swag Labs`.
