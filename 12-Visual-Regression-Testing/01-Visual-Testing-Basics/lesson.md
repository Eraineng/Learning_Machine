# Lesson 1 — Visual Testing Basics

📂 Code: `visual-project/tests/01-baselines.spec.ts`, `03-detect-regression.spec.ts`

## What visual testing catches that functional tests don't
A functional test clicks "Export report" and asserts a download starts. It passes even if the button is:
- invisible (white text on white), behind another element, 2px tall, or bright green instead of blue
- pushed off screen on mobile
- overlapped by a banner
- rendered with a broken font or missing icon

Run `npm test` and look at `03-detect-regression`: v2 changed **1.68%** of pixels — a button colour and a padding
value. No functional test would notice. A human reviewer might not either.

## The baseline workflow
1. **Create the baseline** — approved screenshots, committed to git (`npm run update`)
2. **Every run**: take a new screenshot and compare pixel by pixel
3. **Difference found** → the test fails and a **diff image** is produced (red = changed pixels)
4. A human decides:
   - 🐞 **Bug** → fix the code
   - ✅ **Intended change** → update the baseline (`npm run update`) and commit the new image

> Visual tests don't know right from wrong. They only know **changed** vs **unchanged**. A human always approves.

## Playwright's `toHaveScreenshot`
```ts
await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });
await expect(page.locator('.card')).toHaveScreenshot('card.png');     // one component
await expect(page.getByRole('button')).toHaveScreenshot();            // auto-named
```
- First run: the baseline doesn't exist → it's written and the test **fails** (by design). Run again → passes.
- Baselines live in `tests/<spec>-snapshots/<name>-<project>-<platform>.png`
- ⚠️ Names include the **platform** (`win32`, `linux`), because fonts and anti-aliasing differ per OS.
  Baselines made on Windows will **not** match a Linux CI runner → generate baselines in Docker/CI, or
  run `--update-snapshots` inside the same container CI uses.

### Tolerance options
| Option | Meaning |
|--------|---------|
| `maxDiffPixels: 100` | Allow up to 100 differing pixels |
| `maxDiffPixelRatio: 0.01` | Allow 1% of pixels to differ |
| `threshold: 0.2` | How different a single pixel's colour must be to count (0 = exact, 1 = anything) |
| `animations: 'disabled'` | Freeze CSS animations and transitions ⭐ |
| `caret: 'hide'` | Hide the text cursor |
| `mask: [locator]` | Paint over unstable regions |
| `stylePath` | Inject CSS just for the screenshot |
| `clip: {x,y,width,height}` | Screenshot a rectangle |

Too strict → constant false failures. Too loose → real bugs slip through. Start around `maxDiffPixelRatio: 0.01`.

## Full page vs component
| | Full page | Component |
|--|-----------|-----------|
| Catches layout problems | ✅ | ❌ |
| Breaks on any unrelated change | ❌ very often | ✅ rarely |
| Pinpoints the cause | ❌ "something moved" | ✅ "the button changed" |

**Best practice: mostly component screenshots, a few key full-page ones.** Our
`component-level diff pinpoints WHICH element changed` test shows why: header 0, table 0, button 4031 pixels,
container size changed.

## What to capture
- Key pages in their important **states**: empty, loading, with data, error, logged out/in
- **Components**: buttons (normal/hover/focus/disabled), cards, modals, forms with validation errors
- **Responsive breakpoints**: 375 / 768 / 1280
- **Themes**: light and dark
- Not: every page at every size — that's thousands of images nobody reviews

## How pixel comparison works (`03-detect-regression.spec.ts`)
```ts
const changed = pixelmatch(baseline.data, current.data, diff.data, width, height, { threshold: 0.1 });
```
That's the core of every visual tool: decode both PNGs, compare each pixel's colour within a tolerance,
write differing pixels into a diff image, and count them. Smarter tools add anti-aliasing detection and
layout-aware comparison.

## Try it
1. `npm test`, open the report, and look at the attached baseline/current/diff images of the regression test.
2. Change `--brand` in `dashboard-v1.html` to `#d90429`, run `npm test`, and look at the failure diff. Then `npm run update` and run again.
3. Set `maxDiffPixelRatio: 0` in the config and re-run. Does anything become flaky?
4. Add a baseline for the dashboard at 320px width. Does the layout survive?
