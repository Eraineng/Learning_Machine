# Lesson 2 — Automated Accessibility Testing

📂 Code: `a11y-project/tests/01-axe-scan.spec.ts`

## axe-core
The engine behind most accessibility tools (axe DevTools, Lighthouse a11y checks, many CI plugins).
It runs in the page and checks ~100 rules against the rendered DOM.

```ts
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])   // which standard to enforce
  .analyze();

expect(results.violations).toEqual([]);
```

### The result object
| Field | Meaning |
|-------|---------|
| `violations` | Failed rules ← what you assert on |
| `passes` | Rules that passed |
| `incomplete` | **Needs a human to decide** (e.g. contrast over an image) |
| `inapplicable` | Rules with nothing to check |

Each violation has `id`, `impact` (minor/moderate/serious/critical), `help`, `helpUrl` and `nodes`
(with the CSS selector and `failureSummary` explaining the fix).

### Useful builder methods
```ts
new AxeBuilder({ page })
  .include('#main').exclude('.third-party-widget')   // scope the scan
  .withTags(['wcag2aa', 'best-practice'])
  .withRules(['color-contrast'])                     // only these rules
  .disableRules(['region'])                          // known/accepted issues (document why!)
  .analyze();
```

## Making failures useful
```ts
// ❌ "expected 4 to be 0" — tells the developer nothing
expect(results.violations.length).toBe(0);

// ✅ shows exactly which rule and which element
expect(results.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target)}`)).toEqual([]);

// ✅ attach the full JSON to the HTML report
await testInfo.attach('axe.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
```

## Where to run scans
1. **Per page** in a dedicated a11y test file (like ours)
2. **Inside existing E2E tests** — scan each important state (modal open, error shown, menu expanded), because most pages are only fully rendered after interaction:
```ts
test('checkout is accessible', async ({ page }) => {
  await login(page); await addToCart(page); await page.getByRole('button', { name: 'Checkout' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
```
3. **In CI** on every PR (→ folder 14), so new violations can't be merged

## Other tools
| Tool | Type | Use |
|------|------|-----|
| **axe DevTools** (browser extension) | Manual, interactive | Fast checks while developing; highlights elements |
| **WAVE** (extension) | Manual, visual | Great visual overlay of issues |
| **Lighthouse** (DevTools/CI) | Automated audit | Accessibility score + other categories |
| **Pa11y / pa11y-ci** | CLI | Scan a list of URLs in CI |
| **Accessibility Insights** (Microsoft) | Manual + guided | **FastPass** + guided manual checks: excellent for learning |
| **ANDI** (bookmarklet) | Manual | US-gov tool, inspects names/roles |
| **eslint-plugin-jsx-a11y** | Static | Catches issues in React code before rendering |
| **Storybook a11y addon** | Component-level | Check components in isolation |

## Handling a legacy app with hundreds of violations
1. Scan everything and **baseline** the current state
2. Prevent **new** violations: fail CI only on rules/pages already clean
3. Fix by **impact**: critical → serious → moderate, and highest-traffic pages first
4. Track progress with a count per release; remove `disableRules` exclusions as you fix them

## Limits (say this out loud in interviews)
A tool cannot judge:
- Whether alt text is **meaningful** (`alt="image123.png"` passes the "has alt" rule)
- Whether the **tab order** makes sense
- Whether an error is actually **announced**
- Whether a custom widget behaves like the control it imitates
- Whether the content is understandable
- Whether focus goes somewhere sensible after an action

Our `inaccessible.html` proves it: 12 problems, 4 detected.

## Try it
1. `npm test`, then open the HTML report and the attached `axe-violations.json`.
2. Fix **one** issue in `inaccessible.html` (add `lang="en"`), re-run, and watch the violation count drop.
3. Install the **axe DevTools** or **WAVE** browser extension and scan 3 sites you use daily. How many critical issues?
4. Add an axe scan to your `07-Playwright-UI-Automation` saucedemo tests, in the logged-in state.
