# Lesson 4 — Emulators, Real Devices and Cloud Device Farms

## Emulator / simulator vs real device
| | Emulator (Android) / Simulator (iOS) | Real device |
|--|--------------------------------------|-------------|
| Cost | Free | Expensive to buy and maintain |
| Speed to start | Fast, scriptable, parallel | Slower, manual handling |
| CI friendly | ✅ Easy | Needs a device lab or cloud |
| Real performance | ❌ Uses your PC's CPU/RAM | ✅ True performance |
| Camera, GPS, biometrics, NFC | Limited/simulated | ✅ Real |
| Battery, heat, real networks | ❌ | ✅ |
| Push notifications, app store install | Limited | ✅ |
| Touch feel, gestures | Mouse-based | ✅ Real |

**Practical strategy:** develop and run regression on emulators/cloud; verify release candidates and critical flows on a few **real** Tier 1 devices.

## Android tooling: `adb` (worth knowing)
```powershell
adb devices                                   # list connected devices/emulators
adb install app.apk                           # install
adb uninstall com.example.app
adb shell pm list packages | findstr example  # find the package name
adb logcat *:E                                # error logs (crash investigation!)
adb shell screencap /sdcard/s.png; adb pull /sdcard/s.png
adb shell input swipe 500 1500 500 300        # manual swipe
adb shell dumpsys battery set level 5         # simulate low battery
adb emu gsm call 5551234567                   # simulate an incoming call (emulator)
adb shell settings put global airplane_mode_on 1
```
iOS equivalents: `xcrun simctl` (list, boot, install, openurl, push notifications).

## Cloud device farms
Run tests on hundreds of real devices, in parallel, from CI — and test iOS without owning a Mac.
| Service | Notes |
|---------|-------|
| **BrowserStack App Automate / Live** | Huge device list, easy Appium/Playwright integration |
| **Sauce Labs** | Enterprise favorite, strong reporting |
| **LambdaTest** | Cost-effective |
| **AWS Device Farm** | Pay per device-minute |
| **Firebase Test Lab** | Android-focused, free tier, great "Robo test" crawler |
| **Perfecto / Kobiton** | Enterprise |

Typical setup change: point the Appium/WebDriver client at the cloud's endpoint with your credentials, plus device capabilities:
```js
hostname: 'hub.browserstack.com',
capabilities: { 'bstack:options': { deviceName: 'Samsung Galaxy S23', osVersion: '13.0', projectName: 'Shop' } }
```
⚠️ Keep credentials in **environment variables / CI secrets**, never in the repo.

## Manual mobile testing that still matters
Automation can't judge everything. Do a manual pass for:
- Look and feel on a real screen in sunlight, one-handed use, thumb reach
- Keyboard covering fields, awkward tab order
- Animations and perceived speed
- Notifications, deep links, share sheets
- Accessibility with TalkBack/VoiceOver actually switched on
- Install → upgrade → reinstall flows

## Monitoring real users
Because you can't test every device, watch production:
- **Crash reporting:** Firebase Crashlytics, Sentry (crash-free users %, stack traces per device/OS)
- **Analytics:** which devices/OS versions your users have → feeds your device matrix
- **Performance:** app start time, ANRs (Android "app not responding"), network errors
- **Store reviews:** users report bugs there before they report them to you

## Try it
1. Install Android Studio, create an emulator, and try 5 `adb` commands from the list above.
2. Sign up for a free trial of BrowserStack or use Firebase Test Lab's free tier; run one test on a real device.
3. Write the **device matrix** you'd use for a European banking app (Tier 1/2/3) and justify each choice.
4. Find the crash-free rate and top 3 devices of any app you have analytics access to (or describe how you would).
