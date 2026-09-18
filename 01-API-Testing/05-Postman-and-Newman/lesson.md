# Lesson 5 — Postman Test Scripts & Newman ⭐ (core skill on your list)

📂 Runnable: `collections/qa-practice.postman_collection.json` — 7 requests, **24 assertions, all passing**

Postman is what most QA interviews mean by "API testing". Playwright (lesson 3) is what you use in CI.
Learn both: same concepts, different syntax.

## Setup
```powershell
cd 01-API-Testing/05-Postman-and-Newman
npm install
npm test           # runs the whole collection headless with newman
npm run test:data  # data-driven: 1 request × 5 CSV rows
npm run test:html  # pretty HTML report in reports/
```
**In the Postman app:** Import → drop in both files from `collections/`, pick the environment
top-right, then **Run collection**.

## The script slots
| Slot | Runs | Used for |
|------|------|----------|
| **Pre-request Script** | Before the request is sent | Build unique data, compute a signature, refresh a token |
| **Tests** (post-response) | After the response arrives | Assertions, saving values for the next request |
| Collection/folder level | Around every request inside | Shared auth, shared assertions |

## Assertions you'll write every day
```js
// Status
pm.test('Status code is 200', () => pm.response.to.have.status(200));
pm.test('Status is one of', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));

// Headers
pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');

// Response time (a cheap non-functional check)
pm.expect(pm.response.responseTime).to.be.below(2000);

// Body
const body = pm.response.json();
pm.expect(body.id).to.eql(1);
pm.expect(body.title).to.be.a('string').and.not.empty;
pm.expect(body).to.have.property('createdAt');
pm.expect(body.items).to.have.lengthOf(3);
pm.expect(pm.response.text()).to.include('success');
```
The assertion library is **Chai** (`expect`), the same style as Playwright/Vitest.

## ⭐ JSON schema validation (the answer that impresses interviewers)
One assertion that checks **structure + types + required fields + formats** at once:
```js
const postSchema = {
  type: 'object',
  required: ['userId', 'id', 'title', 'body'],
  properties: {
    userId: { type: 'integer', minimum: 1 },
    id:     { type: 'integer' },
    title:  { type: 'string', minLength: 1 },
    body:   { type: 'string' }
  },
  additionalProperties: false      // ⭐ fails if the API adds an unexpected field
};
pm.test('Body matches schema', () => pm.response.to.have.jsonSchema(postSchema));
```
Why it matters: it catches **contract drift** — a field renamed, a number turned into a string, a
required field gone missing — which is exactly what breaks consumers (see folder 10).

Arrays:
```js
pm.response.to.have.jsonSchema({
  type: 'array', minItems: 1,
  items: { type: 'object', required: ['id','email'],
           properties: { email: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' } } }
});
```

## ⭐ Variables and scope (the trap that cost us a failing run)
```
local  >  data (CSV)  >  environment  >  collection  >  global
```
Reading uses `{{name}}` anywhere (URL, headers, body). Writing needs the **right scope**:
```js
pm.environment.set('token', body.token);      // wins over collection scope
pm.collectionVariables.set('postSchema', ...);
pm.globals.set('x', 1);                       // avoid: too broad
const id = pm.environment.get('createdPostId');
pm.environment.unset('token');
```
> 🐞 **What actually happened while building this collection:** request 02 saved `createdPostId` only to the
> *collection* scope, but the environment file also defined `createdPostId` (empty). The environment won, so
> `{{createdPostId}}` resolved to `""`, the URL became `/posts/` and the API returned the whole array instead
> of one object. The schema assertion failed with "data should be object".
> **Lesson: if a variable exists in several scopes, write to the one that wins.**

### Dynamic variables (built into Postman)
`{{$guid}}` `{{$timestamp}}` `{{$randomInt}}` `{{$randomFirstName}}` `{{$randomEmail}}` — great for unique test data
(ties into folder 09: unique data = parallel-safe tests).

## Request chaining
```js
// request A (Tests):
pm.environment.set('createdPostId', pm.response.json().id);
// request B (URL):  {{baseUrl}}/posts/{{createdPostId}}
```
Our collection does create → read-back, and **catches that the mock API never persisted the write** —
a `201` that stores nothing is a real, critical class of bug.

## Data-driven runs
`data/posts-data.csv`:
```csv
postId,expectedUserId,expectedStatus,description
1,1,200,first post belongs to user 1
99999,,404,non-existent post returns 404
```
```js
const postId = pm.iterationData.get('postId');
pm.test(`Status is ${expectedStatus} for post ${postId}`, () => pm.response.to.have.status(expectedStatus));
```
```powershell
npm run test:data      # newman ... -d data/posts-data.csv  → 5 iterations
```
In the Postman app: Runner → select the collection → **Data** file → Run.

## Auth in Postman
| Type | Where |
|------|-------|
| Bearer token | Authorization tab → Bearer, value `{{token}}` |
| Basic / API key | Authorization tab |
| OAuth2 | Authorization tab → Get New Access Token |
| Token refresh | Collection-level **pre-request script** that logs in when `{{token}}` is empty |

```js
// collection pre-request: log in once, reuse the token
if (!pm.environment.get('token')) {
    pm.sendRequest({
        url: pm.environment.get('baseUrl') + '/auth',
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: pm.environment.get('apiPassword') }) }
    }, (err, res) => pm.environment.set('token', res.json().token));
}
```
🔐 Never commit real secrets. Use **secret**-type environment variables, and keep real values local or in CI secrets.

## Newman = Postman in CI
```powershell
newman run collection.json -e env.json                       # basic
newman run collection.json -e env.json -d data.csv           # data-driven
newman run collection.json --folder "07 Data-driven..."      # one folder
newman run collection.json -r cli,junit --reporter-junit-export reports/junit.xml    # CI reporting
newman run collection.json -r htmlextra --reporter-htmlextra-export reports/report.html
newman run collection.json --bail                            # stop on first failure
newman run collection.json -n 3 --delay-request 200          # 3 iterations, throttled
```
Newman exits non-zero when any assertion fails → the pipeline goes red (folder 14).
```yaml
- run: npx newman run collections/qa-practice.postman_collection.json -e collections/qa-practice.postman_environment.json -r cli,junit --reporter-junit-export results/junit.xml
- uses: dorny/test-reporter@v1
  if: always()
  with: { path: results/junit.xml, reporter: java-junit }
```

## Postman vs Playwright API testing — the interview answer
> "Postman is excellent for exploring an API, manual verification, and letting non-developers run collections;
> newman puts the same collection in CI with JUnit reporting. I prefer code-based tests (Playwright/RestAssured)
> for the regression suite, because they give real version control, reuse, typing, loops, and setup/teardown
> without duplicating scripts across requests. In practice I explore in Postman and promote the valuable checks
> into the code suite."

## Try it
1. `npm test`, then open the collection in the Postman app and read every Tests tab.
2. Add request `08 PATCH /posts/1` with tests: 200, `title` changed, other fields unchanged, schema valid.
3. Make a schema fail on purpose (change `type: 'integer'` to `'string'` for `id`) and read the failure message.
4. Add 3 rows to the CSV, including one expecting 404, and run `npm run test:data`.
5. Write a collection-level test that runs for **every** request: `Content-Type is JSON` and `responseTime < 2000`.
6. Point `baseUrl` at your own API from folder 04 (`npm start` there → `http://localhost:3000`) and write 5 tests against it.
