import { test, expect } from '@playwright/test';

test.describe('Headers, data types and performance', () => {
  test('response is JSON', async ({ request }) => {
    const response = await request.get('/users/1');
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('user has the right fields and types', async ({ request }) => {
    const user = await (await request.get('/users/1')).json();

    // Shape check: these fields must exist with these types
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.stringMatching(/^\S+@\S+\.\S+$/),
        address: expect.objectContaining({
          city: expect.any(String),
        }),
      }),
    );
  });

  test('responds within 2 seconds', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/posts');
    const duration = Date.now() - start;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });
});
