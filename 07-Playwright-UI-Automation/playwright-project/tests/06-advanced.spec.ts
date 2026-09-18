// Lesson 6 — network mocking, saved login state, API + UI, multiple tabs
import { test, expect } from '@playwright/test';
import path from 'node:path';

const MOCK_DEMO = 'https://demo.playwright.dev/api-mocking';

test.describe('network mocking', () => {
  test('replace an API response with fake data', async ({ page }) => {
    await page.route('*/**/api/v1/fruits', (route) =>
      route.fulfill({ json: [{ name: 'Mocked Mango', id: 1 }] }),
    );
    await page.goto(MOCK_DEMO);

    await expect(page.getByText('Mocked Mango')).toBeVisible();
  });

  test('modify the real API response', async ({ page }) => {
    await page.route('*/**/api/v1/fruits', async (route) => {
      const response = await route.fetch(); // call the real API
      const json = await response.json();
      json.push({ name: 'Extra Kiwi', id: 999 });
      await route.fulfill({ response, json });
    });
    await page.goto(MOCK_DEMO);

    await expect(page.getByText('Extra Kiwi')).toBeVisible();
  });

  test('simulate a server error', async ({ page }) => {
    await page.route('*/**/api/v1/fruits', (route) => route.fulfill({ status: 500, body: 'boom' }));
    const responsePromise = page.waitForResponse('**/api/v1/fruits');
    await page.goto(MOCK_DEMO);

    const response = await responsePromise;
    expect(response.status()).toBe(500);
  });

  test('block images to speed up tests', async ({ page }) => {
    await page.route(/\.(png|jpe?g|svg)$/, (route) => route.abort());
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});

test('save login state and reuse it (skip the login form)', async ({ browser }, testInfo) => {
  const stateFile = path.join(testInfo.outputDir, 'auth.json');

  // 1. Log in once and save cookies + localStorage to a file
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await page1.goto('/');
  await page1.getByPlaceholder('Username').fill('standard_user');
  await page1.getByPlaceholder('Password').fill('secret_sauce');
  await page1.getByRole('button', { name: 'Login' }).click();
  await expect(page1).toHaveURL(/inventory/);
  await context1.storageState({ path: stateFile });
  await context1.close();

  // 2. New browser context loads that state → already logged in
  const context2 = await browser.newContext({ storageState: stateFile });
  const page2 = await context2.newPage();
  await page2.goto('/inventory.html');
  await expect(page2.getByTestId('title')).toHaveText('Products');
  await context2.close();
});

test('new tab / popup', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Click Here' }).click();
  const newTab = await popupPromise;

  await expect(newTab.getByRole('heading')).toHaveText('New Window');
  await expect(page.getByRole('heading')).toHaveText('Opening a new window');
});

test('API + UI together: request fixture checks the page source', async ({ request, page }) => {
  // Use the API to check preconditions quickly, then test the UI
  const response = await request.get('https://the-internet.herokuapp.com/status_codes/404');
  expect(response.status()).toBe(404);

  await page.goto('https://the-internet.herokuapp.com/status_codes');
  await page.getByRole('link', { name: '404' }).click();
  await expect(page.getByText('This page returned a 404 status code')).toBeVisible();
});

test('take a screenshot', async ({ page }, testInfo) => {
  await page.goto('/');
  const file = testInfo.outputPath('login-page.png');
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach('login page', { path: file, contentType: 'image/png' }); // shows in HTML report
});
