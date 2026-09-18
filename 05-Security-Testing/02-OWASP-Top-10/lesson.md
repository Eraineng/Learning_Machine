# Lesson 2 — OWASP Top 10

**OWASP** (Open Worldwide Application Security Project) publishes the **Top 10** most critical web application security risks. It's the standard reference in the industry, in job interviews and in compliance requirements.

This lesson uses the **2021** list, which this folder's code examples are mapped to. OWASP updates the list every few years, so check https://owasp.org/Top10/ for the newest edition. The core ideas stay the same.

---

## A01: Broken Access Control (#1 most common)
Users can act outside their permissions.
- **IDOR:** `/api/orders/1001` → change to `1002` → see someone else's order
- Missing function-level checks: a normal user calls `/admin/users`
- Changing `role` in a request (mass assignment)
- Accessing pages by URL while logged out
- CORS misconfiguration

**Defense:** deny by default; check ownership **on the server** for every request; don't rely on hiding buttons in the UI.
📂 `tests/03-access-control.test.ts`

## A02: Cryptographic Failures
Sensitive data not properly protected.
- Passwords stored in plain text or with weak hashes (MD5, SHA1 without a salt)
- HTTP instead of HTTPS
- Sensitive data in responses, logs or URLs
- Hard-coded encryption keys

**Defense:** HTTPS everywhere (HSTS); hash passwords with **bcrypt/scrypt/Argon2**; don't return or log secrets.
📂 `tests/04-auth-data-config.test.ts` → "Sensitive data exposure"

## A03: Injection
Untrusted input is interpreted as code or commands.
- **SQL injection:** `' OR '1'='1' --`
- **XSS (Cross-Site Scripting):** `<script>…</script>` runs in other users' browsers
- **Command injection:** `; rm -rf /` passed to a shell
- NoSQL, LDAP, template injection (`{{7*7}}`)

**Defense:** parameterized queries; output encoding/escaping; input validation (allow-lists); Content-Security-Policy.
📂 `tests/01-sql-injection.test.ts`, `tests/02-xss.test.ts`

### XSS types
| Type | Payload stored? | Example |
|------|-----------------|---------|
| **Reflected** | No, it's in the URL/request | `/search?q=<script>` |
| **Stored** | Yes, saved in the DB | Malicious comment shown to every visitor |
| **DOM-based** | Client-side JS writes input to the page | `innerHTML = location.hash` |

## A04: Insecure Design
Flaws in the design itself, which no amount of perfect code can fix.
- A password reset using "security questions" that can be guessed
- No limit on how many gift cards can be tried
- Business logic abuse: apply a coupon multiple times, negative quantities

**Defense:** threat modeling, abuse cases ("as an attacker, I want to…"), secure design patterns.

## A05: Security Misconfiguration
- Default passwords (`admin/admin`)
- Detailed error messages and stack traces shown to users
- Missing security headers
- Directory listing enabled, debug mode in production
- Unnecessary features/ports open, cloud storage buckets public

**Defense:** hardened config, automated checks, generic errors, security headers.
📂 `tests/01-sql-injection.test.ts` (leaked SQL), `tests/04-…` (headers)

## A06: Vulnerable and Outdated Components
Using libraries with known CVEs (Log4Shell, old jQuery, old OpenSSL).
**Defense:** `npm audit`, Dependabot/Renovate, Snyk, SBOM, remove unused dependencies.

## A07: Identification and Authentication Failures
- No brute-force protection
- Weak passwords allowed
- **User enumeration:** "User not found" vs "Wrong password"
- Session tokens that don't expire, predictable tokens, sessions not invalidated on logout
- Missing MFA for sensitive actions

**Defense:** rate limiting/lockout, strong password policy, MFA, generic error messages, secure session handling.
📂 `tests/04-auth-data-config.test.ts` → "Brute force protection"

## A08: Software and Data Integrity Failures
- Auto-updates without signature checks
- CI/CD pipeline compromise, untrusted npm packages (supply-chain attacks)
- Insecure deserialization

**Defense:** signed artifacts, lock files, protected pipelines, Subresource Integrity (SRI) for CDN scripts.

## A09: Security Logging and Monitoring Failures
Breaches go unnoticed for months.
- Failed logins, access denials and admin actions not logged
- Logs not monitored or alerted on
- Logs containing passwords/tokens (that's a problem too!)

**Test:** perform an attack in a test environment. Was it logged? Did anyone get alerted?

## A10: Server-Side Request Forgery (SSRF)
The app fetches a URL provided by the user → the attacker makes the **server** call internal systems.
`POST /fetch-image { "url": "http://169.254.169.254/latest/meta-data/" }` → cloud credentials leaked.
**Defense:** allow-list of domains, block internal IP ranges, don't return raw responses.

---

## Other OWASP resources
| Resource | Use |
|----------|-----|
| **OWASP API Security Top 10** | API-specific risks (BOLA = IDOR for APIs, excessive data exposure, lack of rate limiting) |
| **OWASP ASVS** | Detailed security **requirements checklist**: great for writing security test cases |
| **OWASP WSTG** | Web Security Testing Guide: how to test everything, step by step |
| **OWASP Cheat Sheet Series** | How to defend against each issue |
| **OWASP Juice Shop** | Intentionally vulnerable app with 100+ challenges |

## Try it
1. For each of A01–A10, write one test idea for a banking app.
2. Start `npm run start:vuln` and open `http://127.0.0.1:4001/search?q=<script>alert('XSS')</script>` in your browser. Then try the same on port 4002.
3. Read the OWASP API Security Top 10. Which items are covered by `security-project`? Which are missing?
