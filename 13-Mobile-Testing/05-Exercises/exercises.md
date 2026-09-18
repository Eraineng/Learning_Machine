# Mobile Testing — Exercises

## Level 1 — Mobile web (runnable now)
1. Run `npm test` in `mobile-web-project`. Note the runtime per device project. Which is slowest and why?
2. Add a **tap target** test: every link on https://the-internet.herokuapp.com/ must be ≥ 44×44 px. How many fail?
3. Add a test that the page has a correct `<meta name="viewport" content="width=device-width...">`.
4. Add a **dark mode** test using `colorScheme: 'dark'` and assert the background color changes.
5. Test https://www.saucedemo.com on Pixel 7: log in, add an item, open the cart. Does anything break on a small screen?

## Level 2 — Mobile conditions
6. Write a test that fills half a form, rotates the device, and verifies the input is still there.
7. Test an offline → online transition: go offline, try an action, assert a graceful message, go online, assert recovery.
8. Use CPU throttling (`rate: 6`) and measure how much slower the page becomes. Is it still usable?
9. Emulate `locale: 'ar-EG'` (right-to-left). Does the layout survive? (Try any RTL-supporting site.)

## Level 3 — Test design for mobile
10. Write a test plan for a **mobile banking app login**: list 20 test cases covering biometrics, interruptions, permissions, offline, rotation and accessibility.
11. Build a **device matrix** (Tier 1/2/3) for an app whose users are 70% Android, mostly in India, with 20% still on Android 11.
12. List 10 things you would test **only manually**, and say why automation isn't worth it for each.

## Level 4 — Appium (needs Android Studio)
13. Set up Android Studio + emulator + Appium; run `appium-doctor --android` until it's clean.
14. Open the Sauce Labs demo APK in **Appium Inspector** and write down the locators for the login screen.
15. Run `login.e2e.js`. Then add a test for the "locked out" user.
16. Write an **interruption test**: background the app for 10s during checkout, return, verify state.
17. Write an **upgrade test**: install version 1, create data, install version 2 over it, verify the data survives.

## Level 5 — Cloud
18. Run one Playwright mobile-web test on BrowserStack (free trial) against a real device. Compare results with emulation.
19. Set up Firebase Test Lab's **Robo test** on any APK and read the crawl report.

## Quiz
1. Native, hybrid and mobile web — which tool for each?
2. Two things device emulation can NOT test.
3. Why are accessibility ids the best Appium locator?
4. Name 5 mobile-only test conditions that don't exist on desktop.
5. Which `adb` command shows error logs?
6. Why test on the **oldest** supported OS version?

<details><summary>Answers</summary>

1. Native → Appium/Espresso/XCUITest; hybrid → Appium (with context switching) or Detox; mobile web → Playwright/Selenium.
2. Real device performance, real touch hardware, battery/heat, camera/biometrics, real network conditions, OS browser UI quirks (any two).
3. They work on both Android and iOS, are stable across UI refactors, and improve real accessibility.
4. Interruptions (calls/notifications), rotation, permissions, offline/cellular switching, battery/low storage, hardware back button, app upgrade/install.
5. `adb logcat *:E`.
6. It usually has the most differences from current APIs, and a meaningful share of real users are still on it.

</details>
