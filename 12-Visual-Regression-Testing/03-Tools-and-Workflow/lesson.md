# Lesson 3 — Tools, CI and Team Workflow

## Tool landscape
| Tool | Type | Notes |
|------|------|-------|
| **Playwright `toHaveScreenshot`** | Built-in, free, self-hosted | ⭐ Start here. Baselines in git, diffs in the HTML report. You own everything |
| **BackstopJS** | Free, config-driven | Standalone visual regression for URLs/components |
| **jest-image-snapshot** | Free, Jest | Similar idea in the Jest ecosystem |
| **Percy** (BrowserStack) | Cloud SaaS | Web UI for approvals, cross-browser rendering, git integration |
| **Applitools Eyes** | Cloud SaaS, AI | "Visual AI" ignores anti-aliasing/noise, groups similar diffs, very low flakiness |
| **Chromatic** | Cloud SaaS | Built for **Storybook** component libraries ⭐ for design systems |
| **Lost Pixel / Argos** | Open source + cloud | Modern, cheaper alternatives |

**Self-hosted (Playwright)**: free, private, but you manage baselines, OS differences and review by reading diff images in the report.
**Cloud tools**: approval UI, baselines per branch, rendering on many real browsers, smarter diffing — at a cost per screenshot.

## Component-level visual testing with Storybook
If the team has a design system, this is the highest-value setup:
- Every component + state is a **story**
- Chromatic/Playwright screenshots each story
- A CSS change that breaks 12 components shows up as 12 clear, isolated diffs before it ever reaches a page

## CI integration
```yaml
- run: npx playwright test
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: visual-report
    path: playwright-report/      # contains baseline/actual/diff images
```
Key points:
- ⚠️ **Generate baselines in the same environment as CI** (same Docker image), or every run fails on font rendering.
  `docker run -v ${PWD}:/work -w /work mcr.microsoft.com/playwright:v1.55.0-noble npx playwright test --update-snapshots`
- Store baselines in git (they're small PNGs) so a diff is visible in code review
- On failure, publish the report as an artifact so reviewers can see the images
- Update baselines in a **separate, clearly labelled commit** ("chore: update visual baselines for new brand colour")

## Team workflow that works
1. **Design change planned** → developer updates code + baselines in the same PR
2. **Reviewer** looks at the baseline image diff in the PR: "yes, that's the new header" ✅
3. **Unexpected diff** → bug, fixed before merge
4. **Nobody approves baselines blindly.** If diffs are noisy, fix the flakiness instead of raising tolerance

## When visual testing is worth it
✅ Design systems and component libraries
✅ Marketing/landing pages where look = product
✅ Apps with many themes, locales or breakpoints
✅ Preventing CSS refactors from silently breaking pages

## When it isn't
❌ UI that legitimately changes every day (early prototypes)
❌ Highly dynamic content you'd have to mask into oblivion
❌ As a replacement for functional tests — it checks looks, not behavior
❌ Without a clear owner: unreviewed visual tests rot fast

## Cost control
Screenshots are cheap to take but expensive to **review**. Keep the set small and meaningful:
- 10 well-chosen component screenshots beat 200 full-page ones
- Group by risk: what would embarrass the company if it broke?

## Try it
1. Run `npm test`, open `npx playwright show-report`, and study how failures display baseline/actual/diff.
2. Try `npx playwright test --update-snapshots` after an intentional change and check `git status`: those PNGs are your approval record.
3. Read one CI config from folder 14 and add a visual test job to it.
4. (Optional) Create a free Percy or Chromatic account and push one project to see the cloud approval flow.
