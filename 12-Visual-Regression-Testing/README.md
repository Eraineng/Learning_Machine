# Visual Regression Testing — Learning Roadmap

Functional tests check that the button **works**. Visual tests check that it still **looks right**:
no overlapping text, no broken layout, no accidentally green button, no missing logo.

```
visual-project/
├── pages/
│   ├── dashboard-v1.html    the "current" design (baseline)
│   ├── dashboard-v2.html    the "new build" with 2 subtle CSS regressions
│   └── dynamic.html         timestamps, random ids, ads, a spinner
└── tests/
    ├── 01-baselines.spec.ts        toHaveScreenshot: full page, component, hover, responsive
    ├── 02-dynamic-content.spec.ts  4 techniques for unstable content
    ├── 03-detect-regression.spec.ts  how a pixel diff works, and which element changed
    └── screenshot.css              CSS injected only during screenshots
```

## Setup
```powershell
cd visual-project
npm install
npm run update     # first time: create baseline images (they're committed to git)
npm test           # compare against baselines
npm run report     # see baseline / actual / diff images side by side
```

## How it works
```
        Take screenshot  ──►  Compare with baseline  ──►  same?  ✅ pass
                                      │
                                    different  ──► ❌ fail + produce a DIFF image
                                                     → real bug? fix it
                                                     → intended change? update the baseline
```

## Checklist
- [ ] `01-Visual-Testing-Basics/lesson.md`: what it catches, baselines, workflow
- [ ] `02-Stable-Screenshots/lesson.md`: defeating flakiness
- [ ] `03-Tools-and-Workflow/lesson.md`: Playwright vs Percy/Applitools/BackstopJS, CI, review process
- [ ] `04-Exercises/exercises.md`
