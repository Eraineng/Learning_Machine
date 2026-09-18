// Conditions that only matter on mobile: rotation, slow networks, offline, permissions, gestures.
import { test, expect } from '@playwright/test';

test('rotation: portrait → landscape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'only relevant on mobile devices');

  await page.setViewportSize({ width: 390, height: 844 }); // portrait
  await page.goto('https://the-internet.herokuapp.com/');
  await expect(page.getByRole('heading', { name: 'Welcome to the-internet' })).toBeVisible();

  await page.setViewportSize({ width: 844, height: 390 }); // landscape
  await expect(page.getByRole('heading', { name: 'Welcome to the-internet' })).toBeVisible();
});

test('offline mode shows a failure instead of hanging', async ({ page, context }) => {
  await page.goto('https://the-internet.herokuapp.com/');

  await context.setOffline(true);
  const navigation = page.goto('https://the-internet.herokuapp.com/abtest').catch((e) => e);
  await expect(navigation).resolves.toBeInstanceOf(Error); // network error, as expected

  await context.setOffline(false);
  await page.goto('https://the-internet.herokuapp.com/abtest');
  await expect(page.getByRole('heading')).toContainText('A/B Test');
});

test('slow network (Chromium only)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP throttling is Chromium-only');
  test.setTimeout(60_000); // throttled pages are slow — give the test room

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150, // ms round trip
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // ~1.6 Mbps ("Slow 4G")
    uploadThroughput: (750 * 1024) / 8,
  });

  const start = Date.now();
  await page.goto('https://the-internet.herokuapp.com/');
  const loadTime = Date.now() - start;

  console.log(`Load time on a throttled connection: ${loadTime} ms`);
  await expect(page.getByRole('heading', { name: 'Welcome to the-internet' })).toBeVisible();
});

test('geolocation permission and position', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['geolocation'],
    geolocation: { latitude: 48.8584, longitude: 2.2945 }, // Eiffel Tower
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  });
  const page = await context.newPage();
  await page.goto('https://the-internet.herokuapp.com/geolocation');

  const position = await page.evaluate(
    () =>
      new Promise<{ lat: number; lon: number }>((resolve) =>
        navigator.geolocation.getCurrentPosition((p) =>
          resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        ),
      ),
  );
  expect(position.lat).toBeCloseTo(48.8584, 3);
  await context.close();
});

test('swipe / scroll gesture', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch gestures need a touch device');
  await page.goto('https://the-internet.herokuapp.com/infinite_scroll');

  const before = await page.locator('.jscroll-added').count();

  // A swipe gesture: touch down, drag, release
  await page.mouse.move(200, 600);
  await page.mouse.down();
  await page.mouse.move(200, 100, { steps: 10 });
  await page.mouse.up();

  // Then scroll to the bottom to trigger loading more.
  // ⚠️ page.mouse.wheel() is not supported on WebKit, so scroll in the page instead.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      return page.locator('.jscroll-added').count();
    }, { timeout: 15_000 })
    .toBeGreaterThan(before);
});
