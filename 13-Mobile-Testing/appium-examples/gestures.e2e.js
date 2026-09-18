// Gestures and device-level interactions — the things that make mobile testing different.

describe('Mobile gestures and device conditions', () => {
  it('swipes up (scroll) using W3C actions', async () => {
    const { width, height } = await driver.getWindowSize();

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: width / 2, y: height * 0.8 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 500, x: width / 2, y: height * 0.2 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  });

  it('uses built-in Appium gesture shortcuts (UiAutomator2)', async () => {
    const element = await $('~product-item');
    await driver.execute('mobile: scrollGesture', {
      elementId: element.elementId,
      direction: 'down',
      percent: 3.0,
    });
    await driver.execute('mobile: longClickGesture', { elementId: element.elementId, duration: 2000 });
    await driver.execute('mobile: pinchCloseGesture', { elementId: element.elementId, percent: 0.75 });
  });

  it('handles rotation', async () => {
    await driver.setOrientation('LANDSCAPE');
    await expect(await $('~products screen')).toBeDisplayed();
    await driver.setOrientation('PORTRAIT');
  });

  it('survives backgrounding the app (interruption)', async () => {
    await driver.background(5); // send to background for 5 seconds
    await expect(await $('~products screen')).toBeDisplayed(); // state preserved?
  });

  it('handles a phone call / notification interruption', async () => {
    // Android emulator: adb emu gsm call 5551234567
    // Then verify the app recovers and no data was lost.
  });

  it('works offline', async () => {
    await driver.setNetworkConnection(1); // 1 = airplane mode (Android)
    await $('~refresh').click();
    await expect(await $('~offline banner')).toBeDisplayed(); // graceful message, not a crash
    await driver.setNetworkConnection(6); // wifi + data back on
  });

  it('checks the back button (Android hardware key)', async () => {
    await driver.back();
    await expect(await $('~products screen')).toBeDisplayed();
  });

  it('switches between native and web context (hybrid apps)', async () => {
    const contexts = await driver.getContexts(); // ['NATIVE_APP', 'WEBVIEW_com.app']
    await driver.switchContext(contexts.find((c) => c.includes('WEBVIEW')));
    // now you can use CSS selectors like a normal web page
    await $('#submit').click();
    await driver.switchContext('NATIVE_APP');
  });
});
