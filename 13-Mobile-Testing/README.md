# Mobile Testing — Learning Roadmap

Phones break things that desktops never do: tiny screens, touch, interruptions, flaky networks, permissions,
battery, and thousands of device/OS combinations.

```
13-Mobile-Testing/
├── mobile-web-project/     ✅ RUNNABLE: Playwright device emulation (4 device profiles)
└── appium-examples/        📖 Reference: native app automation with Appium + WebdriverIO
```

## Setup (mobile web — works right now)
```powershell
cd mobile-web-project
npm install
npx playwright install chromium webkit     # WebKit = the Safari engine, needed for iPhone/iPad profiles
npm test                                   # runs on Pixel 7, iPhone 14, iPad and desktop
npm run test:ui
```

For native apps (Appium) you need Android Studio or Xcode. See `03-Appium-Native-Apps/lesson.md`.

## Checklist
- [ ] `01-Mobile-Testing-Fundamentals/lesson.md`: app types, device strategy, what to test
- [ ] `02-Mobile-Web-Testing/lesson.md`: emulation, responsive, touch, network (runnable code)
- [ ] `03-Appium-Native-Apps/lesson.md`: Appium architecture, setup, locators, gestures
- [ ] `04-Devices-and-Cloud/lesson.md`: emulators vs real devices, device farms, adb
- [ ] `05-Exercises/exercises.md`
