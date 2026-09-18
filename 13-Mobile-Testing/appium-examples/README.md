# Appium examples (reference only — not runnable without a mobile SDK)

These files show what real **native app** automation looks like. To actually run them you need a
mobile toolchain (Android Studio + SDK, or Xcode on macOS). Setup instructions are in
`../03-Appium-Native-Apps/lesson.md`.

| File | Shows |
|------|-------|
| `wdio.conf.js` | WebdriverIO + Appium config with Android & iOS capabilities |
| `login.e2e.js` | A native login test with Appium locators |
| `gestures.e2e.js` | Swipe, scroll, long press, device interactions |
| `page-objects/LoginScreen.js` | Page Object for a native screen |

Practice app: **Sauce Labs My Demo App** (`Android.SauceLabs.Mobile.Sample.app.apk`, free download from
https://github.com/saucelabs/my-demo-app-android/releases) — put the `.apk` in an `apps/` folder.
