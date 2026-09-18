// Baseline screenshot testing with Playwright's built-in toHaveScreenshot().
// First run: `npm run update` creates the baselines in tests/__screenshots__ (and FAILS by design).
// Later runs compare against them.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const page_ = (name: string) => pathToFileURL(path.join(process.cwd(), 'pages', name)).href;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 }); // fixed size → stable screenshots
});

test('full page matches the baseline', async ({ page }) => {
  await page.goto(page_('dashboard-v1.html'));
  await expect(page).toHaveScreenshot('dashboard-full.png', { fullPage: true });
});

test('a single component matches the baseline', async ({ page }) => {
  await page.goto(page_('dashboard-v1.html'));

  // Component-level screenshots are far less brittle than whole pages
  await expect(page.locator('.card').first()).toHaveScreenshot('card-revenue.png');
  await expect(page.getByRole('button', { name: 'Export report' })).toHaveScreenshot('button-export.png');
});

test('a region of the page', async ({ page }) => {
  await page.goto(page_('dashboard-v1.html'));
  await expect(page.locator('table')).toHaveScreenshot('orders-table.png');
});

test('hover state', async ({ page }) => {
  await page.goto(page_('dashboard-v1.html'));
  const button = page.getByRole('button', { name: 'Export report' });
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');
});

test('responsive: the same page at 3 widths', async ({ page }) => {
  await page.goto(page_('dashboard-v1.html'));

  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(page).toHaveScreenshot(`dashboard-${width}.png`, { fullPage: true });
  }
});
