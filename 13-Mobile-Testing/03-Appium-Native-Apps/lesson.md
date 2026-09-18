# Lesson 3 — Appium: Automating Native Apps

📂 Reference code: `appium-examples/`

## What Appium is
The standard open-source tool for automating **native, hybrid and mobile web** apps on Android and iOS,
using the **same WebDriver API** you know from Selenium/WebdriverIO.

```
Your test (JS/Java/Python)
        │  WebDriver protocol (HTTP/JSON)
        ▼
  Appium Server  ──► UiAutomator2 driver ──► Android device/emulator
                 └─► XCUITest driver     ──► iOS device/simulator
```
One test can target both platforms if you use cross-platform locators (**accessibility ids**).

## Setup (Android on Windows)
```powershell
# 1. Java + Android Studio (includes SDK + emulator)
#    Set ANDROID_HOME, e.g. C:\Users\<you>\AppData\Local\Android\Sdk
# 2. Appium 2 + driver
npm install -g appium
appium driver install uiautomator2
# 3. Check your environment
npx appium-doctor --android
# 4. Start an emulator (Android Studio → Device Manager) or plug in a phone with USB debugging
adb devices
# 5. Run the server
appium
# 6. Run tests (in appium-examples/)
npm init -y; npm i -D @wdio/cli webdriverio
npx wdio run wdio.conf.js
```
iOS requires **macOS + Xcode** (`appium driver install xcuitest`). You cannot test iOS natively on Windows;
use a cloud device farm instead (lesson 4).

## Capabilities: telling Appium what to run
```js
{
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Pixel_7_API_34',
  'appium:app': '/path/to/app.apk',          // or appPackage + appActivity for an installed app
  'appium:autoGrantPermissions': true,        // skip permission popups
  'appium:noReset': false,                    // false = clear app data between sessions
}
```

## Locators (most → least preferred)
| Strategy | Example | Notes |
|----------|---------|-------|
| **Accessibility ID** | `$('~login-button')` | ⭐ Works on both platforms, also improves real accessibility |
| Android UiSelector | `$('android=new UiSelector().resourceId("com.app:id/user")')` | Powerful, Android-only |
| iOS Predicate | `$('-ios predicate string:name == "Login"')` | Fast, iOS-only |
| ID / resource-id | `$('#com.app:id/loginBtn')` | Stable if devs set ids |
| Class name | `$('android.widget.Button')` | Too broad |
| XPath | `$('//android.widget.TextView[@text="Login"]')` | ❌ Slowest and most fragile |

**Ask developers to add accessibility ids/labels.** It makes tests stable *and* helps screen-reader users.

## Inspecting the app
- **Appium Inspector** (GUI): connect to a session, tap elements, see their attributes and suggested locators
- `adb shell uiautomator dump` (Android) for the raw XML hierarchy
- Android Studio **Layout Inspector**; Xcode **Accessibility Inspector**

## Gestures
```js
// W3C actions (works everywhere)
await driver.performActions([{ type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
  actions: [ {type:'pointerMove',duration:0,x:500,y:1500}, {type:'pointerDown',button:0},
             {type:'pointerMove',duration:500,x:500,y:300}, {type:'pointerUp',button:0} ] }]);

// Driver shortcuts (UiAutomator2 / XCUITest)
await driver.execute('mobile: scrollGesture', { elementId, direction: 'down', percent: 3 });
await driver.execute('mobile: longClickGesture', { elementId, duration: 2000 });
await driver.execute('mobile: swipe', { direction: 'left' });
```

## Device-level control (this is what makes Appium powerful)
```js
await driver.setOrientation('LANDSCAPE');
await driver.background(5);                 // send app to background 5s (interruption test)
await driver.setNetworkConnection(1);       // airplane mode (Android)
await driver.hideKeyboard();
await driver.back();                        // Android hardware back button
await driver.installApp(path); await driver.removeApp(pkg);   // upgrade tests
await driver.getContexts(); await driver.switchContext('WEBVIEW_com.app');   // hybrid apps
await driver.pushFile(remotePath, base64);  // test data / photo for gallery upload
```

## Making native tests stable
- Never use `sleep`. Use explicit waits: `await el.waitForDisplayed({ timeout: 10000 })`
- Reset app state between tests (`terminateApp` + `activateApp`, or `noReset: false`)
- Use Page Objects per **screen** (see `page-objects/LoginScreen.js`)
- Hide the keyboard before clicking buttons it might cover
- Emulators are slower than real devices → generous timeouts
- Run tests in parallel across devices, not on one device

## Alternatives to Appium
| Tool | Platform | Notes |
|------|----------|-------|
| **Espresso** | Android | Google's, runs in-process: very fast and stable, Android only |
| **XCUITest** | iOS | Apple's native framework |
| **Maestro** | Both | Simple YAML flows, very easy to start with |
| **Detox** | React Native | Grey-box, fast, synchronizes with the app |
| **Flutter integration_test** | Flutter | Official Flutter testing |

## Try it (needs Android Studio)
1. Install Android Studio, create a Pixel emulator, and run `adb devices`.
2. Download the Sauce Labs demo APK and launch it with `appium` + Appium Inspector. Find 5 accessibility ids.
3. Run `login.e2e.js` against it.
4. Write an interruption test: add an item to the cart, background the app for 10s, return, and verify the cart still has the item.
