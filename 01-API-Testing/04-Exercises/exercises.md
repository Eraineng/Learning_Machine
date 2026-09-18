# API Testing Exercises

Create your own test file: `03-Playwright-API-Tests/tests/my-exercises.spec.ts`.

## Level 1 — GET
1. `GET /todos/1` → status 200, `completed` is a boolean.
2. `GET /comments?postId=1` → every comment has `postId: 1` and an `email` containing `@`.
3. `GET /albums/0` → what status do you get? Write a test for it.

## Level 2 — Write operations
4. `POST /todos` with `{ title, completed: false, userId: 1 }` → 201, body echoes your data.
5. `PATCH /users/1` changing only `email` → 200, new email returned.

## Level 3 — Real API (restful-booker)
6. `GET /booking?firstname=Test` → returns an array.
7. `POST /auth` with a wrong password → what does the API return? Is that good API design?
   (Hint: it returns 200 with `{"reason":"Bad credentials"}` — a tester should report this!)
8. Create a booking with `totalprice: "abc"` (a string). What happens? Is it a bug?

## Level 4 — Clean code
9. Move `BASE` and the login step into a helper function `getToken(request)` and reuse it.
10. Use `test.beforeAll` / `test.beforeEach` to create a booking before each test.

## Reflection
- Which bugs did you find in restful-booker? Write a short bug report for one
  (Title, Steps, Expected, Actual).
