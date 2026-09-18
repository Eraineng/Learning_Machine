// How a visual diff actually works: compare two images pixel by pixel and produce a diff image.
// Here we compare dashboard v1 (baseline) with v2 (the "new build") and catch the regressions.
import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const page_ = (name: string) => pathToFileURL(path.join(process.cwd(), 'pages', name)).href;

async function shot(page: any, file: string) {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto(page_(file));
  return PNG.sync.read(await page.screenshot({ fullPage: true }));
}

test('v2 introduced visual regressions compared with v1', async ({ page }, testInfo) => {
  const baseline = await shot(page, 'dashboard-v1.html');
  const current = await shot(page, 'dashboard-v2.html');

  expect(current.width).toBe(baseline.width);
  const diff = new PNG({ width: baseline.width, height: baseline.height });

  const changedPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 }, // per-pixel colour tolerance
  );
  const totalPixels = baseline.width * baseline.height;
  const percent = (changedPixels / totalPixels) * 100;

  console.log(`${changedPixels} pixels changed (${percent.toFixed(2)}% of the page)`);

  // Attach the three images to the HTML report, exactly like a visual testing tool does
  await testInfo.attach('1-baseline.png', { body: PNG.sync.write(baseline), contentType: 'image/png' });
  await testInfo.attach('2-current.png', { body: PNG.sync.write(current), contentType: 'image/png' });
  await testInfo.attach('3-diff.png', { body: PNG.sync.write(diff), contentType: 'image/png' });

  // In a real test you'd assert there is NO diff. Here we assert the regressions were detected.
  expect(changedPixels).toBeGreaterThan(0);
  expect(percent).toBeLessThan(20); // it's a subtle change — easy to miss by eye
});

test('component-level diff pinpoints WHICH element changed', async ({ page }) => {
  const results: Record<string, number> = {};

  for (const selector of ['header', '.container', 'button', 'table']) {
    await page.setViewportSize({ width: 1000, height: 800 });

    await page.goto(page_('dashboard-v1.html'));
    const before = PNG.sync.read(await page.locator(selector).first().screenshot());

    await page.goto(page_('dashboard-v2.html'));
    const after = PNG.sync.read(await page.locator(selector).first().screenshot());

    results[selector] =
      before.width === after.width && before.height === after.height
        ? pixelmatch(before.data, after.data, null, before.width, before.height, { threshold: 0.1 })
        : -1; // -1 = the element changed size
  }

  console.table(results);
  expect(results['header']).toBe(0); // unchanged
  expect(results['table']).toBe(0); // unchanged
  expect(results['button']).toBeGreaterThan(0); // colour regression
  expect(results['.container']).not.toBe(0); // padding regression (size change → -1)
});
