// Custom fixtures: tests ask for what they need, Playwright builds it for them.
import { test as base } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { InventoryPage } from './InventoryPage';
import { CartPage, CheckoutPage } from './CheckoutPages';

type MyFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage; // already logged in!
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage); // ← the test runs here
  },

  inventoryPage: async ({ loginPage, page }, use) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
