# Lesson 3 — Authentication, Authorization & Sessions

## Authentication vs Authorization
- **Authentication** (AuthN): *Who are you?* Proving identity (password, OTP, biometrics).
- **Authorization** (AuthZ): *What are you allowed to do?* Permissions and roles.

You can be authenticated but not authorized (logged-in user trying an admin action → 403).

## Password security
| Do | Don't |
|----|-------|
| Hash with **bcrypt / scrypt / argon2** (slow, salted) | Store plain text (A02) |
| Enforce length (≥ 8–12), check against breach lists | Force weird complexity rules that lead to `Password1!` |
| Rate-limit and lock out after failures | Allow unlimited guesses |
| Support MFA | Rely on password alone for sensitive systems |
| Generic error: "invalid credentials" | Reveal which field was wrong |

**Never** roll your own crypto or use fast hashes (MD5/SHA-1/SHA-256 alone) for passwords.

## Testing authentication
- Weak passwords accepted? (`123`, `password`)
- Brute force: is there lockout / rate limiting / CAPTCHA after N attempts?
- **User enumeration:** do "wrong password" and "unknown user" differ (message, status, or **response time**)?
- Password reset: are tokens random, single-use, and expiring? Can you reset someone else's?
- Does the account lock out safely (and not become a DoS on real users)?

## Sessions and tokens
After login, the server needs to remember you. Two main approaches:

### Session cookies (server-side session)
Server stores the session; the browser holds a session ID in a cookie.
Cookie flags to check:
| Flag | Purpose |
|------|---------|
| `HttpOnly` | JS can't read the cookie → limits XSS cookie theft |
| `Secure` | Sent only over HTTPS |
| `SameSite=Lax/Strict` | Limits CSRF |
| `Path` / `Domain` / `Expires` | Scope and lifetime |

### JWT (JSON Web Token)
A signed token the client sends in `Authorization: Bearer <token>`.
- Structure: `header.payload.signature` (base64) — the payload is **readable**, so never put secrets in it
- Verify the **signature** and check `exp` (expiry) on every request
- Classic JWT bugs: accepting `alg: none`, weak signing secret, not checking expiry, no revocation
- Paste a token into https://jwt.io to inspect it (don't paste production tokens into websites!)

## Session testing checklist
- Does logout actually invalidate the session server-side (not just delete the cookie)?
- Does the session expire after inactivity and after an absolute max time?
- Is a **new** session ID issued on login (prevents session fixation)?
- Are tokens random and long enough to not be guessable?
- Does changing the password invalidate other sessions?

## CSRF (Cross-Site Request Forgery)
A malicious site makes the victim's browser send an authenticated request to your site (using their cookie).
Defenses: **anti-CSRF tokens**, `SameSite` cookies, checking the `Origin`/`Referer` header.
Note: APIs using `Authorization: Bearer` (not cookies) are largely immune, because the attacker's site can't add that header.

## MFA (Multi-Factor Authentication)
Combine factors: something you **know** (password), **have** (phone/OTP/key), **are** (biometric).
Even a stolen password isn't enough. Test that MFA can't be bypassed (e.g. by going straight to a post-login URL).

## Our app's approach
- Tokens: `randomBytes(32)` → long and unguessable (the vuln app uses only 16 bytes)
- Password check uses `timingSafeEqual` → constant-time compare, resists timing attacks
- `requireAuth` middleware centralizes the check; routes add authorization on top
- ⚠️ It stores sessions in a Map (fine for a demo). Real apps use a store like Redis, set cookie flags, and expire sessions.

## Check yourself
1. Authentication vs authorization, in one sentence each.
2. Why must password hashing be **slow**?
3. What does `HttpOnly` protect against?
4. How can response **time** leak whether a username exists?
5. Why are Bearer-token APIs mostly safe from CSRF?
