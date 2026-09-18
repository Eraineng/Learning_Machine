// Mobile WEB testing: a real browser engine with a phone's viewport, user agent and touch input.
import { test, expect, devices } from '@playwright/test';

test('the emulated device reports phone characteristics', async ({ page, isMobile, browserName }) => {
  await page.goto('https://the-internet.herokuapp.com/');

  const info = await page.evaluate(() => ({
    width: window.innerWidth,
    dpr: window.devicePixelRatio,
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    ua: navigator.userAgent,
  }));

  console.log(`${browserName} | ${info.width}px | DPR ${info.dpr} | touch: ${info.touch}`);
  if (isMobile) {
    expect(info.width).toBeLessThan(1024);
    expect(info.touch).toBe(true);
  }
});

test('responsive layout: content fits without horizontal scrolling', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1); // a common, real mobile bug
});

test('tap works like a click on touch devices', async ({ page, isMobile }) => {
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');
  const addButton = page.getByRole('button', { name: 'Add Element' });

  if (isMobile) {
    await addButton.tap(); // touch event
  } else {
    await addButton.click();
  }
  await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(1);
});

test.describe('one-off device override', () => {
  // Override the screen for just this group. ⚠️ Spreading a whole `devices[...]` entry here
  // fails, because `defaultBrowserType` would force a new worker — pick the fields you need,
  // or set the full device in playwright.config.ts as a project.
  const galaxy = devices['Galaxy S9+'];
  test.use({ viewport: galaxy.viewport, userAgent: galaxy.userAgent, deviceScaleFactor: galaxy.deviceScaleFactor });

  test('narrow screen still shows the main heading', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/');
    await expect(page.getByRole('heading', { name: 'Welcome to the-internet' })).toBeVisible();
    expect(page.viewportSize()!.width).toBeLessThan(500);
  });
});
