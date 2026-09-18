// Lesson 2 — finding elements (locators)
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
});

test('getByRole — the #1 recommended locator', async ({ page }) => {
  // Role + accessible name: how a user / screen reader sees the page
  await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  await expect(page.getByRole('combobox')).toBeVisible(); // the sort <select>
});

test('getByText', async ({ page }) => {
  await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  await expect(page.getByText('Sauce Labs', { exact: false }).first()).toBeVisible();
});

test('getByTestId — stable attributes added for testing', async ({ page }) => {
  // config sets testIdAttribute: 'data-test'
  await expect(page.getByTestId('title')).toHaveText('Products');
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});

test('CSS locator (use when nothing better exists)', async ({ page }) => {
  await expect(page.locator('.inventory_item')).toHaveCount(6);
  await expect(page.locator('#react-burger-menu-btn')).toBeVisible();
});

test('filter + chaining — find the right item, then the button inside it', async ({ page }) => {
  const bikeLight = page.getByTestId('inventory-item').filter({ hasText: 'Bike Light' });

  await expect(bikeLight.getByTestId('inventory-item-price')).toHaveText('$9.99');
  await bikeLight.getByRole('button', { name: 'Add to cart' }).click();

  await expect(bikeLight.getByRole('button', { name: 'Remove' })).toBeVisible();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('first / last / nth and reading all texts', async ({ page }) => {
  const names = page.getByTestId('inventory-item-name');

  await expect(names.first()).toHaveText('Sauce Labs Backpack');
  await expect(names.nth(1)).toHaveText('Sauce Labs Bike Light'); // 0-based
  await expect(names.last()).toHaveText('Test.allTheThings() T-Shirt (Red)');

  const allNames = await names.allTextContents();
  expect(allNames).toHaveLength(6);
});
