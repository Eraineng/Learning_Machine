// WebdriverIO + Appium configuration.
// Run with:  npx wdio run wdio.conf.js   (after: npm i -D @wdio/cli appium appium-uiautomator2-driver)
import path from 'node:path';

export const config = {
  runner: 'local',
  port: 4723, // Appium server port
  specs: ['./*.e2e.js'],
  maxInstances: 1,

  capabilities: [
    {
      // ANDROID
      platformName: 'Android',
      'appium:deviceName': 'Pixel_7_API_34', // emulator name (`avdmanager list avd`) or real device id (`adb devices`)
      'appium:platformVersion': '14.0',
      'appium:automationName': 'UiAutomator2', // the Appium driver
      'appium:app': path.join(process.cwd(), 'apps/Android.SauceLabs.Mobile.Sample.app.apk'),
      'appium:appWaitActivity': '*',
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
      // For MOBILE WEB instead of a native app, use:
      // 'browserName': 'Chrome',
    },
    // iOS (macOS + Xcode only):
    // {
    //   platformName: 'iOS',
    //   'appium:deviceName': 'iPhone 15',
    //   'appium:platformVersion': '17.0',
    //   'appium:automationName': 'XCUITest',
    //   'appium:app': path.join(process.cwd(), 'apps/MyApp.app'),
    // },
  ],

  logLevel: 'info',
  waitforTimeout: 10_000, // default wait for elements
  connectionRetryTimeout: 120_000,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 90_000 },

  // Cloud device farm instead of a local device:
  // user: process.env.SAUCE_USERNAME,
  // key: process.env.SAUCE_ACCESS_KEY,
  // hostname: 'ondemand.eu-central-1.saucelabs.com',
};
