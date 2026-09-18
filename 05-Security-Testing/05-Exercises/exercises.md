# Security Testing — Exercises

Use the local `security-project`. Start the apps with `npm run start:vuln` / `start:secure`.

## Level 1 — Understand the attacks
1. Run `npm test` and read every test. For each 🔓 test, explain in one sentence *why* the attack works.
2. Start the vuln app and reproduce these **by hand** with curl or a browser:
   - SQL injection login bypass as `admin`
   - Reflected XSS in `/search`
   - IDOR: read another user's order
   - Get your password back from `/profile`
3. Do the same requests against the secure app and confirm each is blocked.

## Level 2 — Write security tests
4. Add a `/orders/:id/cancel` (PATCH) endpoint to both modes and write IDOR tests: a user must not cancel another user's order.
5. Add tests proving the secure app's tokens are unguessable (length ≥ 64 hex chars, and two logins produce different tokens).
6. Add a **user-enumeration timing** test: measure average response time for a wrong password vs an unknown user on the vuln app. Are they different?

## Level 3 — Fix vulnerabilities
7. Add **stored XSS**: a `POST /comments` that saves a comment, and `GET /comments` that returns them in HTML. Make the vuln mode store+reflect raw, the secure mode escape on output. Write tests for both.
8. Add an **SSRF** endpoint `POST /fetch {url}` that fetches a URL server-side. Secure it with an allow-list of hosts. Test that internal addresses (`http://127.0.0.1`, `http://169.254.169.254`) are blocked.
9. Add CSRF protection (anti-CSRF token) to a cookie-based version of login, and test it.

## Level 4 — Tools
10. Run `npm audit` here and in the other project folders. Are there any vulnerable dependencies? Write down the highest severity one.
11. Install **OWASP ZAP**. Run a **baseline scan** against `http://127.0.0.1:4001` (vuln) and `:4002` (secure). Compare the alerts.
12. Set up ZAP or Burp as a **proxy** and manually tamper with the `role` field during registration on the vuln app.
13. Run **gitleaks** on this repo. (Bonus: temporarily add a fake `API_KEY="sk-12345"` to a file and confirm it's detected, then remove it.)

## Level 5 — Practice grounds
14. Run **OWASP Juice Shop** locally (`docker run -p 3000:3000 bkimminich/juice-shop`) and solve the first 5 challenges. Which OWASP category is each?
15. Complete 3 free labs on **PortSwigger Web Security Academy** (SQL injection, XSS, access control).
16. Write a **security test report** for the vuln app: list every vulnerability with OWASP category, severity, reproduction steps, impact and fix (use the bug template from folder 00).

## Quiz
1. Name 5 of the OWASP Top 10.
2. What one change fixes most SQL injection?
3. Why hash passwords with bcrypt/scrypt/argon2 instead of SHA-256?
4. What is IDOR? How do you test for it?
5. Difference between reflected and stored XSS?
6. Is it legal to run a port scan against any website you find interesting?
7. What does `npm audit` check?

<details><summary>Answers</summary>

1. Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Auth Failures, Integrity Failures, Logging/Monitoring Failures, SSRF.
2. Use parameterized queries (prepared statements) instead of string concatenation.
3. Those are deliberately slow and salted, so brute-forcing stolen hashes is infeasible; SHA-256 is fast and easy to crack for passwords.
4. Insecure Direct Object Reference: accessing another user's object by changing an id. Test by logging in as user A and requesting user B's resources.
5. Reflected bounces back in the response to a crafted request; stored is saved and served to other users (worse, no user interaction needed).
6. No. Unauthorized scanning is illegal in most jurisdictions. Use authorized targets only.
7. Your dependencies against a database of known vulnerabilities (CVEs).

</details>
