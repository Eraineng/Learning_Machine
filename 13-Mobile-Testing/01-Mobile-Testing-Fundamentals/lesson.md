# Lesson 1 — Mobile Testing Fundamentals

## Three kinds of mobile app
| Type | Built with | Examples | How to test |
|------|-----------|----------|-------------|
| **Native** | Kotlin/Java (Android), Swift/Obj-C (iOS) | Instagram, banking apps | **Appium**, Espresso (Android), XCUITest (iOS) |
| **Hybrid / Cross-platform** | React Native, Flutter, Ionic, Capacitor | Many startup apps | Appium (may need context switching), Detox, Flutter driver |
| **Mobile web / PWA** | HTML/CSS/JS in the phone's browser | m.site.com, responsive sites | **Playwright**, Selenium, browser emulation |

This folder: **mobile web with Playwright** (runnable) + **native with Appium** (reference).

## What makes mobile testing different
| Area | Examples to test |
|------|------------------|
| **Screen sizes** | 320px phones → tablets; text truncation, overlapping elements, horizontal scrolling |
| **Touch input** | Tap, double tap, long press, swipe, pinch-zoom, drag; **tap target size** (≥ 44×44 px) |
| **Orientation** | Rotate mid-flow: is data in a half-filled form kept? |
| **Interruptions** | Incoming call, alarm, notification, low battery, app backgrounded then resumed |
| **Network** | 5G → 3G → offline → back; airplane mode; switching Wi-Fi ↔ cellular mid-request |
| **Permissions** | Camera, location, contacts, notifications: granted, denied, "only while using", revoked later |
| **Installation / upgrade** | Fresh install, upgrade from an old version (does saved data survive?), uninstall |
| **Storage & battery** | Low storage, low battery mode, app size, battery drain |
| **OS versions** | Android 10–15, iOS 15–18; different behavior and permission models |
| **Hardware** | Camera, GPS, biometrics, NFC, accelerometer |
| **Keyboard** | Does it cover the input or the submit button? Correct keyboard type for email/number fields? |
| **Accessibility** | Screen readers (TalkBack/VoiceOver), font scaling to 200%, contrast (→ folder 11) |
| **Interoperability** | Deep links, sharing to/from other apps, push notifications |

## Device fragmentation and test strategy
You can't test everything. Choose a **device matrix** based on data:
1. **Analytics**: which devices/OS versions do *your* users actually use? (top 10 usually cover 60–80%)
2. **Market share** in your target countries
3. **Risk**: oldest supported OS, smallest screen, lowest-end CPU, newest OS (upcoming changes)

A practical matrix:
| Tier | Devices | Test |
|------|---------|------|
| **Tier 1** (must pass) | Top 3–5 devices by usage + newest iOS/Android | Full regression, every release |
| **Tier 2** | Next 10 devices | Smoke tests |
| **Tier 3** | Long tail | Emulators/cloud, spot checks |

## Mobile testing pyramid
```
        /  E2E on real devices  \      few (slow, expensive, flaky)
       /   Appium / emulators    \     some
      /  Component / UI unit tests \   many (Espresso, XCUITest, RN Testing Library)
```
Plus: API tests (folder 01) for everything the app talks to.

## App store readiness
Before release, check: app size, permissions justified, privacy policy/labels, crash-free rate,
store screenshots match the app, minimum OS version, and the app doesn't break on the newest OS beta.

## Check yourself
1. Native vs hybrid vs mobile web — how does testing differ?
2. List 5 things that can interrupt a mobile app mid-flow.
3. How would you choose which 5 devices to test on?
4. Why is tap target size a real (and common) bug?
