import { test, expect } from '@playwright/test';

// Note: jsonplaceholder fakes writes — it returns realistic responses but saves nothing.

test.describe('Create, update, delete', () => {
  test('POST creates a post', async ({ request }) => {
    const newPost = { title: 'My first API test', body: 'Hello Playwright', userId: 1 };

    const response = await request.post('/posts', { data: newPost });

    expect(response.status()).toBe(201); // 201 Created, not 200
    const created = await response.json();
    expect(created).toMatchObject(newPost); // response contains everything we sent
    expect(created.id).toBeDefined(); // server assigned an id
  });

  test('PUT replaces a post', async ({ request }) => {
    const updated = { id: 1, title: 'Replaced title', body: 'Replaced body', userId: 1 };

    const response = await request.put('/posts/1', { data: updated });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  test('PATCH updates one field', async ({ request }) => {
    const response = await request.patch('/posts/1', { data: { title: 'Only title changed' } });

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.title).toBe('Only title changed');
    expect(post.body).toBeTruthy(); // other fields still there
  });

  test('DELETE removes a post', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });
});
