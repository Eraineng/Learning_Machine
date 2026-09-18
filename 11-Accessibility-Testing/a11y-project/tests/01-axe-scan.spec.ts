// Automated accessibility scanning with axe-core (the engine behind most a11y tools).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const page_ = (name: string) => pathToFileURL(path.join(process.cwd(), 'pages', name)).href;

test('🔴 the inaccessible page has many violations (and we list them)', async ({ page }, testInfo) => {
  await page.goto(page_('inaccessible.html'));

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // Print a readable summary — this is what you'd give developers
  const summary = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    elements: v.nodes.length,
    help: v.help,
  }));
  console.table(summary);
  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const ruleIds = results.violations.map((v) => v.id);
  expect(ruleIds).toEqual(
    expect.arrayContaining(['image-alt', 'label', 'color-contrast', 'html-has-lang']),
  );

  // ⚠️ THE KEY LESSON: this page has ~12 real accessibility problems, but axe reports only these
  // WCAG-tagged ones. Div-as-a-button, removed focus outline, meaningless "Click here" link text,
  // skipped heading levels and the unannounced error are NOT caught here.
  // → automated scanning finds roughly 30–40% of issues. Tests in 02-*.spec.ts cover the rest.
  expect(ruleIds.length).toBeLessThan(12);
});

test('🟢 the accessible page has zero violations', async ({ page }) => {
  await page.goto(page_('accessible.html'));

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // A helpful failure message: shows exactly what broke
  expect(
    results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(', ')}`),
  ).toEqual([]);
});

test('scan only part of a page', async ({ page }) => {
  await page.goto(page_('accessible.html'));

  const results = await new AxeBuilder({ page }).include('form').analyze();
  expect(results.violations).toEqual([]);
});

test('check specific rules only', async ({ page }) => {
  await page.goto(page_('inaccessible.html'));

  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(results.violations[0].id).toBe('color-contrast');
  expect(results.violations[0].nodes[0].failureSummary).toContain('contrast');
});

test('disable a rule you have accepted (with a reason!)', async ({ page }) => {
  await page.goto(page_('inaccessible.html'));

  // Example: a known issue tracked as JIRA-123, temporarily excluded so the rest can be enforced
  const results = await new AxeBuilder({ page })
    .disableRules(['color-contrast', 'label', 'image-alt', 'html-has-lang', 'region', 'page-has-heading-one',
      'heading-order', 'form-field-multiple-labels', 'link-name'])
    .analyze();

  console.log('Remaining violations after exclusions:', results.violations.map((v) => v.id));
});
