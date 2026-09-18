# Lesson 5 — Debugging and Tools

Tests **will** fail. Being good at automation means finding out *why* fast.

## 1. Read the error first
```
Error: expect(locator).toHaveText(expected) failed
Locator:  getByTestId('title')
Expected: "Productz"
Received: "Products"
    > 17 |   await expect(page.getByTestId('title')).toHaveText('Productz');
```
It tells you **which locator** failed, what was **expected** and **received**, and the **line**. Most failures are solved right here.

### Common errors
| Error | Usual cause | Fix |
|-------|-------------|-----|
| `Timeout 30000ms exceeded` waiting for locator | Wrong locator, or element never appears | Check the locator in UI mode / codegen |
| `strict mode violation … resolved to N elements` | Locator too broad | `filter`, chaining, `exact: true` |
| `element is not visible` / `intercepts pointer events` | Hidden, or covered by a popup/cookie banner | Close the overlay first |
| `Target page, context or browser has been closed` | Missing `await` | Add `await` |
| Passes alone, fails with others | Tests share data/state | Make tests independent |
| Passes locally, fails in CI | Timing, screen size, data | Use traces; avoid fixed waits |

## 2. UI Mode ⭐ (start here)
```powershell
npx playwright test --ui
```
- Run or re-run single tests, with **watch mode**
- A **timeline** showing the page **before/after every action**
- Pick locators, see console logs and network calls
- This is the best learning and debugging tool

## 3. Headed + slow motion
```powershell
npx playwright test --headed
```
Or in the config: `use: { launchOptions: { slowMo: 500 } }` for 0.5s between actions.

## 4. Debug mode (step through)
```powershell
npx playwright test tests/01-first-test.spec.ts --debug
```
Opens the **Playwright Inspector**: step line by line, and try locators live.
You can also pause anywhere in code:
```ts
await page.pause();
```
In VS Code, set a breakpoint and right-click the ▶ next to the test → **Debug Test**.

## 5. Trace Viewer
A trace is a full recording: DOM snapshots, actions, network, console and screenshots.
Our config saves traces when a test fails (`trace: 'retain-on-failure'`).
```powershell
npx playwright show-trace test-results/<test-folder>/trace.zip
```
Or open the HTML report and click the trace icon. You can also drop the zip on https://trace.playwright.dev.
**Traces are the #1 tool for debugging CI failures.**

## 6. Codegen: record tests
```powershell
npx playwright codegen https://www.saucedemo.com
```
Click around, and Playwright writes the code. Use it to **learn locators and get a draft**, then clean it up:
- Remove unneeded clicks
- Add **assertions** (codegen only records actions; use its "Assert visibility/text" buttons)
- Move things into page objects

## 7. Reports
```powershell
npx playwright show-report
```
Shows pass/fail, duration, steps, errors, screenshots, videos and traces.
Other reporters: `--reporter=list`, `dot`, `line`, `json`, `junit` (for CI).

## 8. Group steps for readable reports
```ts
await test.step('Log in', async () => {
  await loginPage.login('standard_user', 'secret_sauce');
});
await test.step('Add backpack to cart', async () => { /* ... */ });
```

## 9. Console & network from the page
```ts
page.on('console', (msg) => console.log('BROWSER:', msg.text()));
page.on('response', (res) => { if (res.status() >= 400) console.log(res.status(), res.url()); });
```

## Flaky tests checklist
- ❌ `waitForTimeout` → ✅ web-first `expect`
- ❌ Reading values with `textContent()` then `expect(value)` → ✅ `expect(locator).toHaveText()`
- ❌ Tests depending on each other's data → ✅ each test creates its own data
- ❌ `nth(3)` on lists that change order → ✅ `filter({ hasText })`
- ❌ Missing `await` → ✅ enable the ESLint rule `@typescript-eslint/no-floating-promises`
- Run a test many times to catch flakiness: `npx playwright test -g "name" --repeat-each=10`

## Try it
1. Run `npx playwright test --ui` and step through `complete a purchase` in the timeline.
2. Break a locator in `04-page-objects.spec.ts`, run it, then open the trace from the report. Find the exact moment it failed.
3. Use codegen on https://demo.playwright.dev/todomvc: add 2 todos, complete one, and add assertions. Save it as `tests/my-todo.spec.ts` and clean it up.
4. Add `test.step` blocks to the purchase test and look at the report.
