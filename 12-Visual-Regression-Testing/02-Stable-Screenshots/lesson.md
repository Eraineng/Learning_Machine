# Lesson 2 — Making Screenshots Stable (killing flakiness)

📂 Code: `visual-project/tests/02-dynamic-content.spec.ts`

**Flaky visual tests are the #1 reason teams abandon visual testing.** Every false failure costs a human review,
and after a few dozen people start clicking "approve" without looking.

## Sources of instability, and the fix
| Source | Example | Fix |
|--------|---------|-----|
| **Time/date** | "Generated at 14:32:07" | Freeze the clock (`addInitScript` overriding `Date`, or `page.clock`) |
| **Random data** | Session ids, shuffled products | Override `Math.random`, or seed test data |
| **Ads / third-party widgets** | Rotating banners, chat bubbles | `mask`, or hide with `stylePath` CSS, or block the request with `page.route` |
| **Animations / transitions** | Spinners, fade-ins, carousels | `animations: 'disabled'`, `prefers-reduced-motion`, CSS `animation: none` |
| **Blinking caret** | Focused text input | `caret: 'hide'` |
| **Lazy images** | Image loads after the screenshot | Wait: `await expect(img).toHaveJSProperty('complete', true)` or scroll first |
| **Web fonts** | Fallback font in the first frame | Wait for `document.fonts.ready` |
| **Scrollbars** | Appear/disappear per OS | Fixed viewport; `fullPage` screenshots |
| **Live data** | Product list from a real backend | Mock the API (`page.route`) → stable data |
| **Different OS/browser** | Windows vs Linux font rendering | Generate baselines in the same environment as CI (Docker) |
| **Device pixel ratio** | Retina vs standard | `scale: 'css'` and a fixed `deviceScaleFactor` |

## The four techniques in our tests
### 1. Mask
```ts
await expect(page).toHaveScreenshot({ mask: [page.locator('#timestamp'), page.locator('.ad')] });
```
Simple and explicit. The masked area becomes a solid colour — you still see everything around it.

### 2. Freeze time and randomness
```ts
await page.addInitScript(() => {
  const fixed = new Date('2026-01-01T12:00:00Z');
  Date.now = () => fixed.getTime();
  Math.random = () => 0.42;
});
```
Runs **before** the page's own scripts. Modern Playwright also has `await page.clock.setFixedTime(...)`.

### 3. Inject CSS (`stylePath`)
```ts
await expect(page).toHaveScreenshot({ stylePath: 'tests/screenshot.css' });
```
Best for hiding a known list of unstable elements across many tests (ads, chat widget, carousels) and
disabling all animations globally.

### 4. Screenshot only the stable part
The most robust option: capture the component you actually care about.

## Also worth doing
```ts
// Wait for fonts and images before capturing
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');   // use sparingly; prefer explicit waits

// Stable data instead of a live backend
await page.route('**/api/orders', route => route.fulfill({ json: fixedOrders }));

// Fixed viewport and no animations
await page.setViewportSize({ width: 1000, height: 800 });
await page.emulateMedia({ reducedMotion: 'reduce' });
```

## Reviewing failures well
When a visual test fails, ask in this order:
1. Is this change **intended**? (check the PR description)
2. Is it in a **masked/unstable** area? → improve the masking instead of raising tolerance
3. Does it appear in **multiple** unrelated tests? → probably a global CSS change
4. Is it only 1–2 pixels of anti-aliasing? → tune `threshold`, don't approve blindly

## Try it
1. Run the first test in `02-dynamic-content.spec.ts`: it proves two loads produce different images.
2. Remove `animations: 'disabled'` from the config and run the spinner test 5 times (`--repeat-each=5`). How often does it fail?
3. Add a cookie banner `<div>` to `dynamic.html` and hide it via `screenshot.css`.
4. Block the "ad" content with `page.route` instead of masking it (hint: the ad is inline, so use `addInitScript` to stub the array).
