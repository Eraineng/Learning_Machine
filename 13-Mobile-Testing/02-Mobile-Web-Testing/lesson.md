# Lesson 2 — Mobile Web Testing with Playwright

📂 Code: `mobile-web-project/tests/`

## Device emulation
Playwright emulates a device's **viewport, user agent, device pixel ratio, touch support and browser engine**:
```ts
// playwright.config.ts — run the same tests on many devices
projects: [
  { name: 'pixel-7',   use: { ...devices['Pixel 7'] } },     // Chromium engine
  { name: 'iphone-14', use: { ...devices['iPhone 14'] } },   // WebKit engine (real Safari engine!)
  { name: 'ipad',      use: { ...devices['iPad (gen 7)'] } },
]
```
`npx playwright install webkit` is required for the iOS profiles — that's how you catch Safari-only bugs.

⚠️ **Emulation is not the real thing.** It does not reproduce: real touch hardware, device performance,
memory limits, the actual iOS Safari UI (address bar resizing!), or OS-level behaviors.
Use it for fast feedback, then verify key flows on **real devices** (lesson 4).

### Per-test overrides
```ts
test.use({ viewport: { width: 360, height: 740 } });   // ✅ fine inside a describe
test.use({ ...devices['Galaxy S9+'] });                // ❌ error inside a describe:
// "Cannot use({ defaultBrowserType }) in a describe group" → set full devices in the config instead,
// or copy only viewport / userAgent / deviceScaleFactor (see 01-device-emulation.spec.ts)
```

## Useful fixtures and options
```ts
test('...', async ({ page, isMobile, browserName }) => { ... });   // isMobile = touch device
await page.getByRole('button').tap();          // touch tap (needs hasTouch)
await page.setViewportSize({ width: 844, height: 390 });   // rotate
await context.setOffline(true);                            // offline
const context = await browser.newContext({
  permissions: ['geolocation'], geolocation: { latitude: 48.86, longitude: 2.29 },
  locale: 'fr-FR', timezoneId: 'Europe/Paris', colorScheme: 'dark',
});
```

## Network throttling (Chromium only, via CDP)
```ts
const cdp = await page.context().newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false, latency: 150,
  downloadThroughput: 1.6 * 1024 * 1024 / 8,   // "Slow 4G"
  uploadThroughput: 750 * 1024 / 8,
});
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });   // simulate a slower phone CPU
```

## Mobile-web things worth asserting
| Check | How |
|-------|-----|
| No horizontal scrolling | `scrollWidth - clientWidth <= 1` (see test 2) |
| Viewport meta tag exists | `expect(page.locator('meta[name=viewport]')).toHaveAttribute('content', /width=device-width/)` |
| Tap targets big enough | `const box = await el.boundingBox(); expect(box.height).toBeGreaterThanOrEqual(44)` |
| Mobile menu (hamburger) works | Only visible under a breakpoint |
| Images are sized for mobile | check `naturalWidth` vs displayed width |
| Text readable without zoom | font-size ≥ 16px on inputs (stops iOS auto-zoom) |
| Correct keyboard type | `input[type=email]`, `inputmode="numeric"` |

## Cross-engine gotchas (found while writing these tests!)
- `page.mouse.wheel()` **isn't supported on WebKit** → scroll with `page.evaluate(() => window.scrollTo(...))`
- CDP (network/CPU throttling) is **Chromium-only** → `test.skip(browserName !== 'chromium')`
- Throttled pages are slow → raise the timeout with `test.setTimeout(60_000)`

## Try it
1. `npm test` — compare results across the 4 projects. Which engine is slowest?
2. Add a test that the hamburger menu is visible at 375px and hidden at 1280px on a responsive site.
3. Add a tap-target-size check for every link on https://the-internet.herokuapp.com/. How many fail 44×44?
4. Combine with folder 06: measure LCP on a Pixel 7 with 4x CPU throttling.
