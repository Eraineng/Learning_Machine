// The #1 cause of flaky visual tests: content that changes every run.
// Four techniques to make screenshots deterministic.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const page_ = (name: string) => pathToFileURL(path.join(process.cwd(), 'pages', name)).href;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 700 });
});

test('❌ without any handling, the screenshot changes every run', async ({ page }) => {
  await page.goto(page_('dynamic.html'));

  const first = await page.screenshot();
  await page.reload();
  const second = await page.screenshot();

  expect(Buffer.compare(first, second)).not.toBe(0); // proves it: two runs, two different images
});

test('technique 1: mask the unstable regions', async ({ page }) => {
  await page.goto(page_('dynamic.html'));

  // Masked areas are painted a solid colour, so their content can't cause a diff
  await expect(page).toHaveScreenshot('dynamic-masked.png', {
    mask: [page.locator('#timestamp'), page.locator('#session'), page.locator('#ad')],
    maskColor: '#FF00FF',
  });
});

test('technique 2: freeze time and randomness before the page loads', async ({ page }) => {
  await page.addInitScript(() => {
    const fixed = new Date('2026-01-01T12:00:00Z');
    // @ts-ignore — replace Date with a fixed one
    Date = class extends Date { constructor(...args: any[]) { super(...(args.length ? args : [fixed])); } } as any;
    Date.now = () => fixed.getTime();
    Math.random = () => 0.42; // deterministic "random"
  });
  await page.goto(page_('dynamic.html'));

  await expect(page.locator('#timestamp')).toHaveText('2026-01-01T12:00:00.000Z');
  await expect(page).toHaveScreenshot('dynamic-frozen.png');
});

test('technique 3: hide elements with injected CSS', async ({ page }) => {
  await page.goto(page_('dynamic.html'));

  await expect(page).toHaveScreenshot('dynamic-hidden.png', {
    stylePath: path.join(process.cwd(), 'tests', 'screenshot.css'), // hides ads/spinner
  });
});

test('technique 4: screenshot only the stable part', async ({ page }) => {
  await page.goto(page_('dynamic.html'));

  await expect(page.locator('.box').first()).toHaveScreenshot('stable-box.png');
});

test('animations are disabled by config (the spinner is frozen)', async ({ page }) => {
  await page.goto(page_('dynamic.html'));

  // `animations: 'disabled'` in playwright.config.ts makes this repeatable
  await expect(page.locator('#spinner')).toHaveScreenshot('spinner.png');
  await expect(page.locator('#spinner')).toHaveScreenshot('spinner.png'); // twice → identical
});
