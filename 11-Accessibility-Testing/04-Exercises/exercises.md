# Accessibility Testing — Exercises

## Level 1 — See the difference
1. Open both pages in a browser. Using **keyboard only**, try to sign up on each. Write down what's impossible on the bad one.
2. Run `npm test` and read the printed violation table. Then list the problems in `inaccessible.html` that axe did **not** find (there are ~8 — the HTML comments help).
3. For each missed problem, name the WCAG principle (P/O/U/R) it breaks.

## Level 2 — Fix the page
4. Fix `inaccessible.html` one issue at a time, re-running `npm test` after each. Goal: 0 axe violations.
5. Then make the keyboard tests in `02-keyboard-and-semantics.spec.ts` pass against your fixed page (change the `page_('inaccessible.html')` paths in the 🔴 tests and update expectations).
6. Compare your fixed version with `accessible.html`. What did you miss?

## Level 3 — Write tests
7. Write a test that every `<img>` on a page has a non-empty `alt` **or** an explicit `alt=""`, and that no alt text contains a file extension (`.png`, `.jpg`).
8. Write a test that all headings are in order (no jump from `h1` to `h3`).
9. Write a test that every interactive element has a tap/click target of at least 24×24 px (WCAG 2.2).
10. Write a test that focus is trapped inside a modal and returns to the trigger on close. (Build a small modal page first.)

## Level 4 — Real sites
11. Add axe scans to `07-Playwright-UI-Automation`: login page, inventory page and cart on saucedemo. How many violations?
12. Scan https://the-internet.herokuapp.com and 2 sites you use daily. Rank the issues by `impact`.
13. Install **NVDA** and complete a purchase on saucedemo with your eyes closed (seriously — cover the screen). Write down every moment you were lost.

## Level 5 — Process
14. Write an **accessibility test plan** for a signup flow: automated checks, manual checks, tools, and the acceptance criteria.
15. Write 3 accessibility bug reports using the template from folder 00, each with the WCAG criterion and user impact.
16. Add an axe scan step to a CI workflow (see folder 14) that fails the build on `critical` or `serious` violations only.

## Quiz
1. What percentage of accessibility issues do automated tools catch?
2. What does POUR stand for?
3. Which WCAG level is usually the legal target?
4. What's the minimum contrast ratio for normal text at AA?
5. Why is `<div onclick>` a problem?
6. Name 3 things only manual testing can verify.
7. What does `role="alert"` do?
8. First rule of ARIA?

<details><summary>Answers</summary>

1. Roughly 30–40%.
2. Perceivable, Operable, Understandable, Robust.
3. AA.
4. 4.5:1 (3:1 for large text and UI components).
5. It isn't focusable, has no role or accessible name, and doesn't respond to Enter/Space, so keyboard and screen reader users can't use it.
6. Whether alt text is meaningful, whether tab order is logical, whether announcements make sense, whether a custom widget behaves correctly, whether content is understandable (any 3).
7. Makes a live region that screen readers announce immediately when its content changes.
8. Don't use ARIA if a native HTML element can do the job.

</details>
