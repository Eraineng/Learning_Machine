# Lesson 3 — API Integration Tests (HTTP → Logic → Database)

📂 Code: `integration-project/tests/02-api-to-db.test.ts`

## Two ways to test an API
| | In-process (supertest) | Against a running server (Playwright `request`, folder 01) |
|--|------------------------|--------------------------------------------------------------|
| Setup | Import `app`, no port | Deploy/start the server first |
| Speed | ⚡ very fast | Network overhead |
| Access internals | ✅ Swap DB, seed via repository, inspect state | ❌ Only via HTTP |
| Tests deployment config | ❌ | ✅ (real env, proxies, TLS) |
| Typically owned by | Developers / SDETs | QA / SDETs |

Both are valuable. This lesson uses **supertest**.

## Designing the app for testability
```ts
export function createApp(deps: { repo, notifier }) { ... }   // ← dependencies injected
```
Production passes the real DB and real service URL. Tests pass an in-memory DB and a fake server URL.
**If the app creates its own DB connection inside the route file, it's much harder to test.**

## supertest basics
```ts
import request from 'supertest';

await request(app)
  .post('/tasks')
  .set('Authorization', 'Bearer token')
  .send({ title: 'Buy milk' })         // JSON body
  .expect(201)                          // status
  .expect('Content-Type', /json/);      // header

const res = await request(app).get('/tasks?done=true');
expect(res.body).toHaveLength(1);
```

## What makes it an *integration* test?
Not just checking the response, but also **verifying the side effect in the real database**:
```ts
const res = await request(app).post('/tasks').send({ title: 'Buy milk' }).expect(201);
expect(repo.findById(res.body.id)?.title).toBe('Buy milk');     // ✅ persisted
```
And for invalid input, verify **nothing** was written:
```ts
await request(app).post('/tasks').send({}).expect(400);
expect(repo.list()).toHaveLength(0);
```

## Test checklist for each endpoint
| Category | Examples |
|----------|----------|
| Happy path | create/read/update/delete, filters |
| Validation | missing, empty, wrong type, too long, boundary (100 ✅ / 101 ❌) |
| Not found | unknown id → 404 |
| Data transformation | trimming, defaults, booleans, dates |
| Side effects | DB rows, messages sent, cache invalidated |
| Headers | `Content-Type`, `Location` on 201 |
| Auth (if any) | no token 401, wrong role 403 |
| Lifecycle | create → update → delete → 404 |

## Hybrid "arrange via DB, act via API"
```ts
const t = repo.create('Done task');     // fast setup, no HTTP
repo.update(t.id, { done: true });
const res = await request(app).get('/tasks?done=true');   // test the real endpoint
```

## Try it
1. `PATCH /tasks/:id` with `{ "title": "" }`. What happens? Should it be 400? Write the test, then fix `app.ts`.
2. `GET /tasks/abc` (non-numeric id). What does it return? Is that right?
3. `POST /tasks` with a body that isn't JSON (`.set('Content-Type', 'application/json').send('{bad json')`). Which status comes back? Is the error message safe to show users?
4. Run `npm start` and test the real server with your Playwright API tests from `01-API-Testing` (change `baseURL` to `http://localhost:3000`).
