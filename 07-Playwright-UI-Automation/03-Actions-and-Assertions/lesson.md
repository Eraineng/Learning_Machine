# Lesson 3 — Actions and Assertions

📂 Code: `playwright-project/tests/03-actions-assertions.spec.ts`

## Actions
| Action | Example |
|--------|---------|
| Navigate | `await page.goto('/login')`, `page.goBack()`, `page.reload()` |
| Click | `await locator.click()`, `dblclick()`, `click({ button: 'right' })` |
| Type into input | `await locator.fill('text')` (clears first) |
| Type key by key | `await locator.pressSequentially('abc', { delay: 100 })` |
| Clear | `await locator.clear()` |
| Press key | `await locator.press('Enter')`, `page.keyboard.press('Control+A')` |
| Checkbox / radio | `await locator.check()`, `uncheck()`, `setChecked(true)` |
| Dropdown | `await locator.selectOption('Label')` or `{ value: '2' }` |
| Hover | `await locator.hover()` |
| Focus | `await locator.focus()` |
| Upload | `await locator.setInputFiles('path/to/file.pdf')` |
| Drag | `await source.dragTo(target)` |
| Scroll | `await locator.scrollIntoViewIfNeeded()` |

## Reading values (when you need data, not a check)
```ts
const text = await locator.textContent();
const texts = await locator.allTextContents();
const value = await locator.inputValue();
const href = await locator.getAttribute('href');
const count = await locator.count();
const visible = await locator.isVisible();
```
⚠️ These return **right now** and do **not** retry. For checks, use `expect`.

## Assertions

### Web-first assertions (auto-retry, so always use these for the page)
```ts
// Page
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle('My App');

// Visibility & state
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();      // toBeDisabled()
await expect(locator).toBeChecked();
await expect(locator).toBeEditable();
await expect(locator).toBeFocused();
await expect(locator).toBeEmpty();

// Content
await expect(locator).toHaveText('Exact text');       // or regex, or array for lists
await expect(locator).toContainText('part');
await expect(locator).toHaveValue('typed value');
await expect(locator).toHaveAttribute('href', '/home');
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveCount(6);
await expect(locator).toHaveCSS('color', 'rgb(255, 0, 0)');

// Negate anything
await expect(locator).not.toBeVisible();
```

### Generic assertions (no retry, for plain values)
```ts
expect(price).toBe(29.99);
expect(list).toEqual(['a', 'b']);
expect(list).toContain('a');
expect(n).toBeGreaterThan(0);
```

### Soft assertions (keep going after a failure)
```ts
await expect.soft(page.getByTestId('title')).toHaveText('Products');
await expect.soft(page.getByTestId('cart')).toBeVisible();
// the test still reports failures at the end, but runs every line
```

## ⭐ Auto-waiting: the most important idea
Before **acting**, Playwright waits until the element is:
attached → visible → stable (not animating) → enabled → not covered by something else.

Assertions **retry** until they pass or time out (5s by default).

```ts
// ❌ Bad: flaky and slow
await page.waitForTimeout(3000);
const text = await page.locator('#finish').textContent();
expect(text).toBe('Hello World!');

// ✅ Good: waits exactly as long as needed
await expect(page.locator('#finish')).toHaveText('Hello World!');
```
**If you type `waitForTimeout`, stop and think again.** There's almost always a better way.

## Special cases
### Dialogs (alert / confirm / prompt)
Playwright **auto-dismisses** dialogs. To handle one, register a handler **before** triggering it:
```ts
page.once('dialog', (dialog) => dialog.accept('optional prompt text'));
await page.getByRole('button', { name: 'Delete' }).click();
```

### iframes
```ts
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Card number').fill('4242...');
```

### Upload without a real file
```ts
await page.locator('input[type=file]').setInputFiles({
  name: 'test.txt', mimeType: 'text/plain', buffer: Buffer.from('hello'),
});
```

### New tab / popup
```ts
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open' }).click();
const popup = await popupPromise;
```

## Try it
1. On https://the-internet.herokuapp.com/add_remove_elements/ click "Add Element" 3 times, assert 3 "Delete" buttons, delete one, and assert 2.
2. On https://the-internet.herokuapp.com/dynamic_controls click "Remove", assert the checkbox disappears and the message "It's gone!" appears. Then enable the text input and type into it.
3. On https://the-internet.herokuapp.com/drag_and_drop drag A onto B and assert the column headers swapped.
