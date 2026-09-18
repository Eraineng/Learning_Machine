# Lesson 3 — Security Testing Techniques

📂 Code: all of `security-project/tests/`

## 1. Map the attack surface first
List every input:
- URL paths and query parameters
- Form fields (including **hidden** fields)
- JSON bodies (including fields the UI doesn't show)
- Headers: `Authorization`, `Cookie`, `Host`, `X-Forwarded-For`, `Referer`
- File uploads (name, type, content, size)
- WebSockets, GraphQL queries

Tools: browser DevTools Network tab, a proxy (ZAP/Burp), API docs (Swagger/OpenAPI).

## 2. Injection testing
### SQL injection test strings
| Payload | Tests |
|---------|-------|
| `'` | Does a single quote cause a 500 / SQL error? That's a strong sign |
| `' OR '1'='1` | Always-true condition |
| `admin' --` | Comment out the rest of the query |
| `1 OR 1=1` | Numeric parameter |
| `'; WAITFOR DELAY '0:0:5'--` / `' OR SLEEP(5)--` | **Blind/time-based**: does the response take 5s? |

Signs of vulnerability: 500 errors, SQL words in errors, different behavior for `'` vs `''`, unexpected login success.

### XSS test strings
```
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><svg onload=alert(1)>
javascript:alert(1)            ← in href/URL fields
{{7*7}}                        ← template injection: shows 49?
```
Check **where the input appears**: HTML body, attribute, JavaScript, URL. Each needs different escaping.

### Automated check in Playwright (does a dialog pop up?)
```ts
test('search is not vulnerable to XSS', async ({ page }) => {
  let alerted = false;
  page.on('dialog', async (d) => { alerted = true; await d.dismiss(); });
  await page.goto(`/search?q=${encodeURIComponent('<img src=x onerror=alert(1)>')}`);
  await page.waitForTimeout(500); // (one of the rare valid uses: waiting for something NOT to happen)
  expect(alerted).toBe(false);
});
```

## 3. Authentication testing checklist
- [ ] Brute force: are there lockout/rate limits after N attempts?
- [ ] User enumeration: are login, register and forgot-password messages and timings identical for existing vs non-existing users?
- [ ] Password policy: minimum length, common passwords blocked (`password123`)?
- [ ] Session token: long and random? Changes after login (session fixation)?
- [ ] Logout: is the token really invalidated on the server? (Reuse the old token after logout)
- [ ] Session timeout after inactivity?
- [ ] "Remember me" and password reset tokens: single-use? Expire? Unguessable?
- [ ] Cookies have `HttpOnly`, `Secure`, `SameSite` flags
- [ ] Sensitive actions (change email/password) require re-authentication
- [ ] JWT: is the signature verified? Is `alg: none` rejected? Is expiry checked?

## 4. Authorization / access control testing
**The two-user technique:** create **User A** and **User B** (and an **Admin**).
1. As A, perform every action and record each request
2. Replay each request with **B's token** → should fail for A's private resources
3. Replay with **no token** → 401
4. Replay admin requests with a **normal user token** → 403
5. Change IDs in every request: sequential, other users' IDs, negative, very large

Also test **horizontal** (same role, other user's data) and **vertical** (user → admin) escalation.

## 5. Business logic testing
Scanners can't find these, so humans must:
- Negative quantity or price: `{ "qty": -5 }` → does money go back to the user?
- Apply the same coupon twice, or stack coupons
- Skip steps: pay → go straight to `/order/confirm` without paying
- Race conditions: redeem a gift card 10 times **in parallel**
- Change the price in the request body
- Currency or rounding tricks

```ts
// Race condition test idea
const results = await Promise.all(
  Array.from({ length: 10 }, () => request(app).post('/giftcard/redeem').send({ code: 'ONE-TIME' })),
);
expect(results.filter((r) => r.status === 200)).toHaveLength(1);
```

## 6. Input validation & file uploads
- Very long strings (10MB), unicode, null bytes `%00`, emoji
- Wrong types: `"age": "abc"`, `"age": []`, `"age": {"$gt": 0}` (NoSQL injection)
- Path traversal: `../../etc/passwd`, `..%2f..%2f`
- Uploads: `.php`/`.exe` renamed to `.jpg`, SVG containing `<script>`, huge files, zip bombs

## 7. Configuration checks
```ts
const res = await request.get('/');
expect(res.headers()['x-powered-by']).toBeUndefined();
expect(res.headers()['strict-transport-security']).toBeDefined();
expect(res.headers()['content-security-policy']).toBeDefined();
```
Also check that these don't exist: `/.git/`, `/.env`, `/backup.zip`, `/admin` (default panel), `/swagger` in prod, debug endpoints.
Online header check: securityheaders.com (for your own sites only).

## 8. Writing security regression tests
When a vulnerability is found and fixed, **add an automated test**, just like `security-project/tests`. It stops the bug from coming back.

Security tests should:
- Assert the **secure behavior** (401/403/404, escaped output, no secrets)
- Use known attack payloads as data (`it.each`)
- Run in CI on every change

## Reporting a security bug
Include: title, **severity (CVSS)**, affected endpoint, steps/payload, **impact** ("any user can read any other user's orders, including addresses"), evidence (request/response), and a suggested fix.
⚠️ Report security bugs **privately** (security team / private tracker), never in public issues.

## Try it
1. Start the vulnerable app and use browser DevTools or curl to log in with `admin' --`. Then call `/admin/users` with the token.
2. Write a test for **logout**: add a `/logout` endpoint to the secure app and prove the old token no longer works.
3. Write a race-condition test for `/register` with the same username 10 times in parallel. How many succeed?
4. Pick 10 items from OWASP ASVS chapter V2 (Authentication) and turn them into test cases.
