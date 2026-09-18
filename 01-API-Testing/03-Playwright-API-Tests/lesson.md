# Lesson 3 — Automated API Tests with Playwright

## Setup (one time)
Open a terminal **in this folder** and run:
```powershell
npm install
```
(No browsers needed for API tests.)

## Run the tests
```powershell
npx playwright test                 # run all tests
npx playwright test tests/01-get    # run one file
npx playwright show-report          # open the HTML report
```

## Anatomy of a test
```ts
import { test, expect } from '@playwright/test';

test('get a post by id', async ({ request }) => {   // 1. `request` = HTTP client
  const response = await request.get('/posts/1');   // 2. send request (baseURL in config)

  expect(response.status()).toBe(200);              // 3. check status
  const body = await response.json();               // 4. parse JSON
  expect(body.id).toBe(1);                          // 5. check data
});
```
- `test(...)` defines one test case
- `async/await` — HTTP calls take time, `await` waits for them
- `expect(...)` — an assertion; if it's false, the test fails

## Files in `tests/`
| File | You learn |
|------|-----------|
| `01-get.spec.ts` | GET, status, JSON body, query params, 404 |
| `02-post-put-delete.spec.ts` | Create / update / delete, sending a body |
| `03-schema-and-headers.spec.ts` | Checking headers, data types, response time |
| `04-auth-flow.spec.ts` | Real-world flow: login → token → use token (restful-booker) |

## Try it
1. Run all tests — all should pass.
2. In `01-get.spec.ts` change `toBe(200)` to `toBe(201)`. Run again and **read the error**. Change it back.
3. Add a new test: GET `/todos/1` and check `completed` is a boolean.
