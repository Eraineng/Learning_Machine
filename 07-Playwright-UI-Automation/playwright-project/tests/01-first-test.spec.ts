// Lesson 1 — your first UI tests
import { test, expect } from '@playwright/test';

test('login page has the right title', async ({ page }) => {
  await page.goto('/'); // baseURL + '/' → https://www.saucedemo.com/
  await expect(page).toHaveTitle('Swag Labs');
});

test('user can log in', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByTestId('error')).toContainText('do not match any user');
  await expect(page).not.toHaveURL(/inventory/);
});
