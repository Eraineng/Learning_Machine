// Native app login test. The API is WebdriverIO; the automation is Appium.
import LoginScreen from './page-objects/LoginScreen.js';

describe('Native app login', () => {
  beforeEach(async () => {
    await driver.terminateApp('com.saucelabs.mydemoapp.android'); // fresh app state
    await driver.activateApp('com.saucelabs.mydemoapp.android');
    await LoginScreen.open();
  });

  it('logs in with valid credentials', async () => {
    await LoginScreen.login('bob@example.com', '10203040');

    // Native locator strategies:
    const products = await $('~products screen'); // ~ = accessibility id (BEST: works on both platforms)
    await expect(products).toBeDisplayed();
  });

  it('shows an error for a wrong password', async () => {
    await LoginScreen.login('bob@example.com', 'wrong');

    const error = await $('android=new UiSelector().textContains("password")');
    await expect(error).toBeDisplayed();
  });

  it('locked out user cannot log in', async () => {
    await LoginScreen.login('alice@example.com', '10203040');
    await expect(await $('~error message')).toBeDisplayed();
  });
});

/* LOCATOR STRATEGIES (most → least preferred)
 * 1. Accessibility ID:  $('~product-item')            ← works on Android + iOS, also helps real users
 * 2. Android UIAutomator: $('android=new UiSelector().resourceId("com.app:id/username")')
 *    iOS Predicate:       $('-ios predicate string:type == "XCUIElementTypeButton" AND name == "Login"')
 *    iOS Class Chain:     $('-ios class chain:**/XCUIElementTypeCell[2]')
 * 3. ID / resource-id:  $('#com.app:id/loginBtn')
 * 4. Class name:        $('android.widget.Button')
 * 5. XPath:             $('//android.widget.TextView[@text="Login"]')   ← slowest and most fragile, avoid
 */
