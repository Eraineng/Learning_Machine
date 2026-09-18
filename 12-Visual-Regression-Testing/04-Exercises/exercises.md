# Visual Regression Testing — Exercises

## Level 1 — Baselines
1. Delete `tests/01-baselines.spec.ts-snapshots/`, run `npm test` (watch it fail), then `npm run update`, then `npm test`. Explain each step's output.
2. Open `dashboard-v1.html` and `dashboard-v2.html` side by side in a browser. Can you spot both regressions by eye? Time yourself.
3. Change the `maxDiffPixelRatio` to `0` and run all tests. Any flakiness?

## Level 2 — Catch a regression
4. Point the baseline tests at `dashboard-v2.html` instead of v1 (without updating baselines). Look at the diff images in the report.
5. Introduce your own regression in v1: make the header 4px shorter. Which tests fail — full page, component, or both?
6. Add a `card-orders.png` and `card-customers.png` component baseline. Break only one card and confirm only that test fails.

## Level 3 — Stability
7. Add a rotating "special offer" banner to `dashboard-v1.html` and make the visual tests stable again, using **each** of the four techniques in turn. Which do you prefer and why?
8. Add a CSS `fadeIn` animation to the cards. Run the tests 10× (`--repeat-each=10`) with and without `animations: 'disabled'`.
9. Freeze time with `page.clock` (the newer Playwright API) instead of `addInitScript`.

## Level 4 — Real app
10. Add visual tests to `07-Playwright-UI-Automation`: saucedemo login page, inventory page, and the cart with 2 items. Mask anything unstable.
11. Capture the same page in 3 viewports and both `colorScheme: 'light' | 'dark'`.
12. Capture 4 states of a button: normal, hover, focus, disabled. (Build a small HTML page for this.)

## Level 5 — Workflow
13. Write the team rules for your visual testing: what gets captured, who approves baselines, what happens on failure, how CI handles OS differences. One page.
14. Research **Applitools Visual AI** vs plain pixel comparison. When is each better? Write 5 bullet points.
15. Set up the tests to run in the official Playwright Docker image so baselines match a Linux CI runner.

## Quiz
1. What does a visual test actually assert?
2. Why do baselines fail when moving from Windows to a Linux CI runner?
3. Name 5 causes of flaky screenshots and a fix for each.
4. Component vs full-page screenshots — trade-offs?
5. A visual test fails. What are the two possible correct actions?
6. Why is "just raise the tolerance" usually the wrong fix?

<details><summary>Answers</summary>

1. That the rendered pixels are the same as the approved baseline — not that they're *correct*.
2. Font rendering and anti-aliasing differ per OS, so almost every pixel shifts slightly.
3. Time/date → freeze the clock; randomness → stub `Math.random`; ads/widgets → mask or hide with CSS; animations → `animations: 'disabled'`; live data → mock the API; fonts → wait for `document.fonts.ready`.
4. Full page catches layout issues but breaks on any change and doesn't pinpoint the cause; components are stable and precise but miss page-level layout problems.
5. Fix the bug, or accept the change and update the baseline.
6. It hides real regressions. The right fix is to remove the source of instability.

</details>
