# Accessibility (a11y) Testing — Learning Roadmap

Can **everyone** use the product, including people who use a screen reader, keyboard only, magnification,
or who are colour blind, have low vision, limited motor control, or cognitive differences?
About **16% of the world's population** lives with a significant disability.

It's also a **legal requirement** in many markets (EU Accessibility Act, ADA, Section 508, EN 301 549).

```
a11y-project/
├── pages/
│   ├── inaccessible.html   ❌ ~12 deliberate problems
│   └── accessible.html     ✅ the same page, fixed, with comments explaining each fix
└── tests/
    ├── 01-axe-scan.spec.ts              automated scanning with axe-core
    └── 02-keyboard-and-semantics.spec.ts  keyboard, focus, roles, announcements
```

## Setup
```powershell
cd a11y-project
npm install
npm test
npm run test:ui
```

## ⭐ The most important fact
Automated tools find only about **30–40%** of accessibility problems.
Our scan of a page with ~12 issues reports **4**. Everything else needs keyboard testing,
screen reader testing, and human judgement. **Automation is a starting point, not a certificate.**

## Checklist
- [ ] `01-Accessibility-Fundamentals/lesson.md`: disabilities, assistive tech, WCAG/POUR
- [ ] `02-Automated-Testing/lesson.md`: axe, Lighthouse, CI integration, limits
- [ ] `03-Manual-Testing/lesson.md`: keyboard, screen readers, zoom, contrast
- [ ] `04-Exercises/exercises.md`
