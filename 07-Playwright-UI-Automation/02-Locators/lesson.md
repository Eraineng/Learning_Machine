# Lesson 2 — Locators: Finding Elements

📂 Code: `playwright-project/tests/02-locators.spec.ts`

A **locator** describes *how to find* an element. It doesn't search right away. It searches
**every time you use it** (click, expect…), so it always finds the latest version of the element.

## Priority order (use the first one that works)
| # | Locator | Example | Why |
|---|---------|---------|-----|
| 1 | `getByRole` | `page.getByRole('button', { name: 'Login' })` | How users and screen readers see the page; checks accessibility too |
| 2 | `getByLabel` | `page.getByLabel('Email')` | Form fields with a `<label>` |
| 3 | `getByPlaceholder` | `page.getByPlaceholder('Username')` | Inputs without a label |
| 4 | `getByText` | `page.getByText('Welcome back')` | Non-interactive text |
| 5 | `getByAltText` | `page.getByAltText('Company logo')` | Images |
| 6 | `getByTitle` | `page.getByTitle('Close')` | Elements with a `title` attribute |
| 7 | `getByTestId` | `page.getByTestId('checkout')` | Stable `data-testid` attributes added by devs for testing |
| 8 | `locator('css')` | `page.locator('#login-button')` | Last resort |
| 9 | `locator('xpath=')` | `page.locator('//div[2]/span')` | Avoid: very fragile |

**Rule:** locate elements **the way a user would describe them**, not by how the HTML happens to be built.
`.btn.btn-primary.mt-3 > span` breaks when a designer changes a class. "The Login button" doesn't.

## Common roles
| Role | HTML |
|------|------|
| `button` | `<button>`, `<input type="submit">` |
| `link` | `<a href>` |
| `textbox` | `<input type="text">`, `<textarea>` |
| `checkbox` / `radio` | `<input type="checkbox/radio">` |
| `combobox` | `<select>` |
| `heading` | `<h1>`–`<h6>` (use `{ level: 2 }` to be specific) |
| `listitem` | `<li>` |
| `row` / `cell` | table rows/cells |
| `img` | `<img alt="...">` |
| `dialog` | modals |

## Text matching
```ts
page.getByText('Log in')                 // substring, case-insensitive
page.getByText('Log in', { exact: true }) // exact match
page.getByText(/log\s?in/i)               // regex
page.getByRole('button', { name: 'Save', exact: true })
```

## Narrowing down
```ts
// Chaining: search INSIDE another element
page.getByTestId('cart').getByRole('button', { name: 'Remove' });

// filter by text
page.getByRole('listitem').filter({ hasText: 'Bike Light' });

// filter by a child element
page.getByRole('listitem').filter({ has: page.getByRole('button', { name: 'Remove' }) });

// filter by NOT having text
page.getByRole('listitem').filter({ hasNotText: 'Sold out' });

// position (use sparingly, since order can change)
locator.first();  locator.last();  locator.nth(2);   // nth is 0-based
```

## Strict mode
If a locator matches **more than one** element and you try to click it, Playwright throws an error:
```
Error: strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements
```
That's a feature: it stops you from clicking the wrong thing. Fix it by narrowing with `filter`, chaining or `exact`.

## Finding locators easily
- **VS Code extension:** "Pick locator", then click an element in the browser
- **Codegen:** `npx playwright codegen https://www.saucedemo.com` records locators while you click
- **UI mode:** `npx playwright test --ui` has a locator picker too
- **Browser DevTools (F12):** inspect the HTML to see roles, labels and `data-test` attributes

## Try it
1. On saucedemo's inventory page, locate the **price** of "Sauce Labs Fleece Jacket" using `filter` and chaining. Assert it's `$49.99`.
2. Locate the "Open Menu" button, click it, then locate and click the **Logout** link with `getByRole`.
3. Write `page.getByRole('button', { name: 'Add to cart' }).click()` without narrowing, run it, and read the strict mode error.
