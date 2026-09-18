# Lesson 2 — OWASP Top 10, Hands-On

📂 Code: `security-project/` (every item below is in `src/app.ts`, attacked in `tests/`)

The **OWASP Top 10** is the industry-standard list of the most critical web app security risks. Learn it.

## A01 — Broken Access Control (#1 most common)
Users doing things they shouldn't be allowed to.
- **IDOR** (Insecure Direct Object Reference): `GET /orders/1` when order 1 isn't yours → `tests/03`
- **Missing function-level auth**: a normal user calling `/admin/users`
- **Mass assignment**: sending `role: "admin"` in a registration body
```
🔓 res.json(order)                              // no ownership check
🔒 if (order.user_id !== user.id) return 404;   // check ownership; 404 hides existence
```
**Test idea:** for every "get by id" and every admin action, log in as a low-privilege user and try it.

## A02 — Cryptographic Failures
Sensitive data exposed: passwords in plain text, no HTTPS, weak hashing, secrets in code.
```
🔓 password stored as "alice123"; /profile returns it
🔒 salted scrypt/bcrypt/argon2 hash; profile returns only id, username, role
```
**Test idea:** does any response contain a password, hash, token or key? Is traffic HTTPS-only?

## A03 — Injection (SQL, NoSQL, command, LDAP) + XSS
Untrusted input treated as code.
### SQL injection → `tests/01`
```
🔓 `SELECT * FROM users WHERE username = '${username}'`   // "admin' --" bypasses the password
🔒 db.prepare('... WHERE username = ?').get(username)      // parameterized: input is always data
```
Payloads to know: `' OR '1'='1' --`, `admin' --`, `'; DROP TABLE users; --`, `' UNION SELECT ...`
### XSS (Cross-Site Scripting) → `tests/02`
Injecting HTML/JS that runs in another user's browser (steal cookies, keylog, deface).
```
🔓 send(`<h1>Results for: ${q}</h1>`)     // q = "<script>alert(1)</script>" executes
🔒 escapeHtml(q)  +  Content-Security-Policy header
```
Types: **Reflected** (in the response to a request), **Stored** (saved then shown to others: worst), **DOM-based** (in client-side JS).

## A04 — Insecure Design
Flaws in the design itself, not a coding bug. E.g. no rate limit on password reset, no limit on ticket purchases, trusting the client to send the price. Fixed by threat modeling, not patches.

## A05 — Security Misconfiguration
Default passwords, verbose errors, unnecessary features, missing security headers, directory listing, debug mode in production.
```
🔓 error → res.send(err.stack); X-Powered-By: Express
🔒 error → generic message; helmet headers; x-powered-by disabled     // tests/04
```

## A06 — Vulnerable & Outdated Components
Using libraries with known CVEs (e.g. Log4Shell). This is often the easiest way in.
```powershell
npm audit          # lists vulnerable dependencies
npm audit fix
```

## A07 — Identification & Authentication Failures
Weak passwords allowed, no brute-force protection, bad session management, user enumeration.
```
🔓 unlimited login attempts; different errors reveal which usernames exist
🔒 lockout after 5 fails; identical error for "no such user" and "wrong password"   // tests/04
```

## A08 — Software & Data Integrity Failures
Unsigned updates, insecure deserialization, CI/CD pipeline tampering, untrusted CDN scripts (add Subresource Integrity).

## A09 — Security Logging & Monitoring Failures
Not logging security events, or not alerting → breaches go unnoticed for months. Log auth events, access-control failures and input-validation failures (but never log passwords or tokens!).

## A10 — Server-Side Request Forgery (SSRF)
Tricking the server into making requests to internal systems: `POST /fetch {"url":"http://169.254.169.254/..."}` to reach cloud metadata. Defend by allow-listing destinations. (Related: **open redirect**, in `tests/04`.)

## How to run the demos
```powershell
npm test                        # attacks vuln + proves secure is protected
npm run start:vuln              # then try attacks by hand:
```
```bash
curl.exe "http://127.0.0.1:4001/search?q=<script>alert(1)</script>"
curl.exe -X POST http://127.0.0.1:4001/login -H "Content-Type: application/json" -d "{\"username\":\"admin' --\",\"password\":\"x\"}"
```

## Check yourself
1. What single coding change stops most SQL injection?
2. Why return 404 (not 403) for another user's order?
3. Reflected vs stored XSS — which is worse and why?
4. Why should "wrong password" and "no such user" give the same error?
