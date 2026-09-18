import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],

  expect: {
    toHaveScreenshot: {
      // How much difference is allowed before a test fails.
      maxDiffPixelRatio: 0.01, // ≤ 1% of pixels may differ (anti-aliasing, font rendering)
      threshold: 0.2, // per-pixel colour sensitivity (0 = strict, 1 = ignore everything)
      animations: 'disabled', // freeze CSS animations/transitions ⭐ kills most flakiness
      caret: 'hide', // hide the blinking text cursor
      scale: 'css', // consistent across device pixel ratios
    },
  },

  use: { trace: 'retain-on-failure' },

  // ⚠️ Screenshots differ between operating systems and browsers, so baselines are per project.
  // Playwright names them e.g. dashboard-chromium-win32.png
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
