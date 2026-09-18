# Lesson 5 — Frontend (Browser) Performance

Load tests measure the **server**. But users experience the **whole page**: downloading JS/CSS/images, rendering, running scripts.
Often **80% of the user's wait time is in the frontend**.

## Core Web Vitals (Google)
| Metric | Measures | Good | Poor |
|--------|----------|------|------|
| **LCP**: Largest Contentful Paint | Loading: when the main content appears | ≤ 2.5 s | > 4 s |
| **INP**: Interaction to Next Paint | Responsiveness: delay after clicks/taps | ≤ 200 ms | > 500 ms |
| **CLS**: Cumulative Layout Shift | Visual stability: things jumping around | ≤ 0.1 | > 0.25 |

Other useful metrics: **TTFB** (server response), **FCP** (First Contentful Paint), **TBT** (Total Blocking Time), **TTI**.

## Tools
| Tool | Use |
|------|-----|
| **Chrome DevTools → Lighthouse** | One-click audit with scores + recommendations |
| **Chrome DevTools → Performance tab** | Record and inspect exactly what the browser did |
| **Chrome DevTools → Network tab** | Waterfall, sizes; throttle to "Slow 4G" |
| **PageSpeed Insights** (pagespeed.web.dev) | Lighthouse + **real user data** from Chrome users |
| **WebPageTest** (webpagetest.org) | Detailed tests from real locations/devices, filmstrip |
| **Lighthouse CI** | Run Lighthouse in CI with budgets |

### Lighthouse from the command line
```powershell
npx lighthouse https://www.saucedemo.com --only-categories=performance --view
```

## Measuring with Playwright
```ts
import { test, expect } from '@playwright/test';

test('homepage loads fast', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  const nav = await page.evaluate(() => {
    const [e] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return { ttfb: e.responseStart, domContentLoaded: e.domContentLoadedEventEnd, load: e.loadEventEnd };
  });
  console.log(nav);
  expect(nav.load).toBeLessThan(3000);
});

test('LCP under 2.5s', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  const lcp = await page.evaluate(() => new Promise<number>((resolve) => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      resolve(entries[entries.length - 1].startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }));
  expect(lcp).toBeLessThan(2500);
});
```

### Simulate a slow network / CPU (Chromium)
```ts
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8,
});
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });   // 4x slower CPU, like a cheap phone
```

## Performance budgets
Agree on limits and fail the build when they're exceeded:
- JS bundle ≤ 200 KB (gzipped)
- LCP ≤ 2.5s on "Slow 4G, mid-tier mobile"
- Total page weight ≤ 1 MB
- ≤ 50 requests

## Common frontend problems
| Problem | Fix |
|---------|-----|
| Huge unoptimized images | Resize, WebP/AVIF, `loading="lazy"` |
| Giant JS bundles | Code splitting, remove unused libraries |
| Render-blocking CSS/JS | `defer`/`async`, inline critical CSS |
| No caching | Cache headers, CDN |
| Layout shifts | Set image width/height, reserve space for ads/banners |
| Too many requests | Bundle, HTTP/2, remove third-party scripts |
| Long JS tasks blocking clicks | Break up work, web workers |

## Try it
1. Run Lighthouse (DevTools → Lighthouse → Mobile) on https://www.saucedemo.com and https://the-internet.herokuapp.com. Compare scores. What are the top 3 recommendations for each?
2. In DevTools Network, throttle to "Slow 4G" and reload. How long until the page is usable?
3. Add the Playwright LCP test above to `07-Playwright-UI-Automation/playwright-project`, then run it with CPU throttling at 6x. Does it still pass?
