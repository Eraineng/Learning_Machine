// Lesson 4a — Page Object Model: tests read like user stories, selectors live in /pages
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage, CheckoutPage } from '../pages/CheckoutPages';

test('complete a purchase', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventory.addToCart('Sauce Labs Backpack');
  await inventory.addToCart('Sauce Labs Onesie');
  await expect(inventory.cartBadge).toHaveText('2');

  await inventory.openCart();
  await expect(cart.items).toHaveCount(2);
  await cart.checkoutButton.click();

  await checkout.fillInfo('Ann', 'Tester', '10001');
  await expect(checkout.total).toHaveText('Total: $41.02');
  await checkout.finishButton.click();

  await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
});

test('locked out user cannot log in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('locked_out_user', 'secret_sauce');
  await loginPage.expectError('this user has been locked out');
});

// Data-driven: the same test with different data
const invalidLogins = [
  { user: '', pass: 'secret_sauce', error: 'Username is required' },
  { user: 'standard_user', pass: '', error: 'Password is required' },
  { user: 'nobody', pass: 'nope', error: 'do not match any user' },
];

for (const { user, pass, error } of invalidLogins) {
  test(`login error: "${error}"`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user, pass);
    await loginPage.expectError(error);
  });
}
