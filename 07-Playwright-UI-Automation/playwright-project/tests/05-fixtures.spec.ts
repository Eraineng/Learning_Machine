// Lesson 4b — custom fixtures: no setup code in the tests at all
import { test, expect } from '../pages/fixtures';

test('products sort by price low → high', async ({ inventoryPage }) => {
  await inventoryPage.sortBy('Price (low to high)');

  const prices = await inventoryPage.getPrices();
  const sorted = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sorted);
});

test('products sort by price high → low', async ({ inventoryPage }) => {
  await inventoryPage.sortBy('Price (high to low)');

  const prices = await inventoryPage.getPrices();
  const sorted = [...prices].sort((a, b) => b - a);
  expect(prices).toEqual(sorted);
});

test('checkout requires first name', async ({ inventoryPage, cartPage, checkoutPage }) => {
  await inventoryPage.addToCart('Sauce Labs Bike Light');
  await inventoryPage.openCart();
  await cartPage.checkoutButton.click();

  await checkoutPage.fillInfo('', 'Tester', '10001');
  await expect(checkoutPage.error).toContainText('First Name is required');
});

test.describe('grouping + hooks', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
  });

  test('badge shows 1 item', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('cart page lists the item', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.items).toContainText('Sauce Labs Backpack');
  });
});
