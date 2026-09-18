// ~60% of accessibility problems are NOT found by automated scanners.
// These tests check the things you must verify yourself: keyboard, focus, names, announcements.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const page_ = (name: string) => pathToFileURL(path.join(process.cwd(), 'pages', name)).href;

test.describe('keyboard operability', () => {
  test('🟢 every interactive element is reachable by Tab, in a logical order', async ({ page }) => {
    await page.goto(page_('accessible.html'));

    const order: string[] = [];
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      order.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;
        }),
      );
    }
    expect(order.slice(0, 6)).toEqual(['a', 'button', 'input#email', 'input#pw', 'input#terms', 'button']);
  });

  test('🟢 the form can be submitted with the keyboard only', async ({ page }) => {
    await page.goto(page_('accessible.html'));

    await page.getByLabel('Email address').focus();
    await page.keyboard.type('not-an-email');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('alert')).toContainText('valid email');
    await expect(page.getByLabel('Email address')).toBeFocused(); // focus moved to the problem
  });

  test('🔴 the fake "Sign up" div cannot be reached or activated by keyboard', async ({ page }) => {
    await page.goto(page_('inaccessible.html'));

    const fakeButton = page.getByText('Sign up');
    await expect(fakeButton).toBeVisible(); // a mouse user sees a button…
    expect(await fakeButton.evaluate((el) => el.tabIndex)).toBe(-1); // …but keyboard users can't reach it
    expect(await fakeButton.evaluate((el) => el.tagName)).toBe('DIV');
  });

  test('🟢 focus is visible when tabbing', async ({ page }) => {
    await page.goto(page_('accessible.html'));
    await page.keyboard.press('Tab');

    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement!);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(outline.style).not.toBe('none');
    expect(parseFloat(outline.width)).toBeGreaterThan(0);
  });

  test('🟢 a skip link lets keyboard users jump past the header', async ({ page }) => {
    await page.goto(page_('accessible.html'));
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  });
});

test.describe('semantics: what a screen reader announces', () => {
  test('🟢 elements have correct roles and accessible names', async ({ page }) => {
    await page.goto(page_('accessible.html'));

    // getByRole IS an accessibility check: it uses the same tree a screen reader uses
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create your account');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'I accept the terms and conditions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('🔴 the inaccessible page has no h1 and unlabeled inputs', async ({ page }) => {
    await page.goto(page_('inaccessible.html'));

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveCount(0); // no accessible name!
    await expect(page.getByRole('button')).toHaveCount(0); // the "buttons" are divs
  });

  test('🟢 images have alt text; decorative images would use alt=""', async ({ page }) => {
    await page.goto(page_('accessible.html'));
    await expect(page.getByRole('img', { name: 'Demo Shop logo' })).toBeVisible();
  });

  test('🟢 error messages are announced via role="alert"', async ({ page }) => {
    await page.goto(page_('accessible.html'));
    await page.getByLabel('Email address').fill('bad');
    await page.getByRole('button', { name: 'Sign up' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Error:'); // meaning isn't conveyed by colour alone
    await expect(page.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
  });

  test('🟢 page zoom to 200% does not break the layout', async ({ page }) => {
    await page.goto(page_('accessible.html'));
    await page.setViewportSize({ width: 640, height: 512 }); // ≈ 200% zoom of 1280×1024

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
  });
});
