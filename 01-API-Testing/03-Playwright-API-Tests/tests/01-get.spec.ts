import { test, expect } from '@playwright/test';

test.describe('GET requests', () => {
  test('get a single post by id', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy(); // true for any 2xx

    const post = await response.json();
    expect(post.id).toBe(1);
    expect(post.userId).toBe(1);
    expect(post.title).toBeTruthy(); // not empty
  });

  test('get a list of users', async ({ request }) => {
    const response = await request.get('/users');
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(10);
  });

  test('filter posts with query params', async ({ request }) => {
    // Same as GET /posts?userId=2
    const response = await request.get('/posts', { params: { userId: 2 } });
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(2);
    }
  });

  test('negative: missing post returns 404', async ({ request }) => {
    const response = await request.get('/posts/99999');
    expect(response.status()).toBe(404);
  });
});
