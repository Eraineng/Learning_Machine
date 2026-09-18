// Lesson 3 — interacting with elements and checking results
// Uses https://the-internet.herokuapp.com — a site full of tricky UI widgets.
import { test, expect } from '@playwright/test';

const SITE = 'https://the-internet.herokuapp.com';

test('checkboxes', async ({ page }) => {
  await page.goto(`${SITE}/checkboxes`);
  const boxes = page.getByRole('checkbox');

  await boxes.first().check();
  await boxes.last().uncheck();

  await expect(boxes.first()).toBeChecked();
  await expect(boxes.last()).not.toBeChecked();
});

test('dropdown (select)', async ({ page }) => {
  await page.goto(`${SITE}/dropdown`);
  const dropdown = page.locator('#dropdown');

  await dropdown.selectOption('Option 2'); // by label
  await expect(dropdown).toHaveValue('2');

  await dropdown.selectOption({ value: '1' }); // by value
  await expect(dropdown).toHaveValue('1');
});

test('keyboard presses', async ({ page }) => {
  await page.goto(`${SITE}/key_presses`);

  await page.locator('#target').press('a');
  await expect(page.locator('#result')).toHaveText('You entered: A');

  await page.keyboard.press('ArrowLeft'); // focus is still in the input
  await expect(page.locator('#result')).toHaveText('You entered: LEFT');

  // Other examples: 'Shift+A', 'Control+A', 'Backspace', 'Escape', 'Tab'
});

test('hover reveals hidden content', async ({ page }) => {
  await page.goto(`${SITE}/hovers`);
  const firstUser = page.locator('.figure').first();

  await expect(firstUser.getByText('name: user1')).toBeHidden();
  await firstUser.hover();
  await expect(firstUser.getByText('name: user1')).toBeVisible();
});

test('auto-waiting: element appears after loading', async ({ page }) => {
  await page.goto(`${SITE}/dynamic_loading/1`);
  await page.getByRole('button', { name: 'Start' }).click();

  // No sleep needed! expect() retries until the text appears (up to the expect timeout)
  await expect(page.locator('#finish')).toHaveText('Hello World!', { timeout: 10_000 });
});

test('JavaScript alert, confirm, prompt dialogs', async ({ page }) => {
  await page.goto(`${SITE}/javascript_alerts`);
  const result = page.locator('#result');

  // Register the handler BEFORE the click that opens the dialog
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Click for JS Alert' }).click();
  await expect(result).toHaveText('You successfully clicked an alert');

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
  await expect(result).toHaveText('You clicked: Cancel');

  page.once('dialog', (dialog) => dialog.accept('Playwright'));
  await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
  await expect(result).toHaveText('You entered: Playwright');
});

test('file upload', async ({ page }) => {
  await page.goto(`${SITE}/upload`);

  // Create a file in memory — no real file needed
  await page.locator('#file-upload').setInputFiles({
    name: 'hello.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Hello from Playwright'),
  });
  await page.locator('#file-submit').click();

  await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
  await expect(page.locator('#uploaded-files')).toHaveText('hello.txt');
});

test('iframes (frames inside the page)', async ({ page }) => {
  await page.goto(`${SITE}/nested_frames`);

  const middle = page
    .frameLocator('frame[name="frame-top"]')
    .frameLocator('frame[name="frame-middle"]');
  await expect(middle.locator('body')).toHaveText('MIDDLE');
});

test('common assertions cheat sheet', async ({ page }) => {
  await page.goto(`${SITE}/login`);

  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveTitle('The Internet');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Login Page');
  await expect(page.locator('#username')).toBeEditable();
  await expect(page.locator('#username')).toBeEmpty();
  await expect(page.locator('#username')).toHaveAttribute('type', 'text');
  await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();

  await page.locator('#username').fill('tomsmith');
  await expect(page.locator('#username')).toHaveValue('tomsmith');
  await page.locator('#password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
  await expect(page.locator('#flash')).toHaveClass(/success/);
});
