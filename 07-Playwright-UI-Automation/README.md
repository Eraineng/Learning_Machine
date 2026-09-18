# Playwright UI Automation — Learning Roadmap

**Prerequisites:** `00-Testing-Fundamentals` and `01-API-Testing` (you already know `test`, `expect`, `async/await`).

All code lives in **one project**: `playwright-project/`. Each lesson tells you which test file to study.

```
playwright-project/
├── playwright.config.ts
├── pages/                      ← Page Objects + fixtures (lesson 4)
└── tests/
    ├── 01-first-test.spec.ts           (lesson 1)
    ├── 02-locators.spec.ts             (lesson 2)
    ├── 03-actions-assertions.spec.ts   (lesson 3)
    ├── 04-page-objects.spec.ts         (lesson 4)
    ├── 05-fixtures.spec.ts             (lesson 4)
    └── 06-advanced.spec.ts             (lesson 6)
```

## Checklist

### 01-Setup-and-First-Test
- [ ] Read `01-Setup-and-First-Test/lesson.md`
- [ ] Install, run all tests, open the HTML report
- [ ] Run a test in headed mode and watch the browser

### 02-Locators
- [ ] Read `02-Locators/lesson.md`
- [ ] Explain why `getByRole` beats CSS/XPath
- [ ] Use `filter()` to find a button inside a specific card

### 03-Actions-and-Assertions
- [ ] Read `03-Actions-and-Assertions/lesson.md`
- [ ] Explain auto-waiting, and why you never need `waitForTimeout`
- [ ] Handle a dialog, an upload and an iframe

### 04-Page-Object-Model-and-Fixtures
- [ ] Read `04-Page-Object-Model-and-Fixtures/lesson.md`
- [ ] Create your own page object
- [ ] Write a data-driven test

### 05-Debugging-and-Tools
- [ ] Read `05-Debugging-and-Tools/lesson.md`
- [ ] Record a test with Codegen
- [ ] Debug a failing test with UI mode and the Trace Viewer

### 06-Advanced-Topics
- [ ] Read `06-Advanced-Topics/lesson.md`
- [ ] Mock an API response
- [ ] Reuse login state

### 07-Exercises
- [ ] Complete `07-Exercises/exercises.md`

## Practice sites used
| Site | Good for |
|------|----------|
| https://www.saucedemo.com | Login, shop, cart, checkout (user `standard_user` / `secret_sauce`) |
| https://the-internet.herokuapp.com | Tricky widgets: dialogs, frames, uploads, hovers, dynamic loading |
| https://demo.playwright.dev/api-mocking | Network mocking |
| https://demo.playwright.dev/todomvc | Classic to-do app for exercises |
