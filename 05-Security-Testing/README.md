# Security Testing — Learning Roadmap

Finding weaknesses before attackers do. This folder focuses on **defensive** and **authorized** testing.

## ⚖️ Ethics and legality (read first)
- ✅ Test systems **you own** or have **explicit written permission** to test (a scope/rules-of-engagement document).
- ✅ Practice on **intentionally vulnerable** apps built for learning (this folder's app, and the list below).
- ❌ Never test a site, app or network without authorization. In most countries this is a **crime** (Computer Fraud and Abuse Act, Computer Misuse Act, etc.), even "just to look".
- ❌ Never use these techniques to access, damage or exfiltrate data that isn't yours.

## The practice app
`security-project/` runs in two modes from the **same code**:
- **`vuln`** — intentionally broken (bound to `127.0.0.1` only)
- **`secure`** — the fixed version

Every test attacks `vuln` (to show the exploit) **and** attacks `secure` (to prove it's fixed). The `secure` tests are the ones you'd keep in a real project.

```
security-project/
├── src/  db.ts · app.ts (vuln + secure side by side) · server.ts
└── tests/  01-sql-injection · 02-xss · 03-access-control · 04-auth-data-config
```

## Setup
```powershell
cd security-project
npm install
npm test                 # run all attack/defense tests
npm run start:vuln       # explore the broken app at http://127.0.0.1:4001
npm run start:secure     # the fixed app at http://127.0.0.1:4002
npm run audit            # scan dependencies for known vulnerabilities
```

## Checklist
- [ ] `01-Security-Fundamentals/lesson.md`: CIA, threats, OWASP Top 10
- [ ] `02-OWASP-Top-10-Hands-On/lesson.md`: the vulnerabilities in the app
- [ ] `03-Auth-and-Session/lesson.md`: authentication, sessions, tokens
- [ ] `04-Tools/lesson.md`: ZAP, Burp, npm audit, secrets, SAST/DAST
- [ ] `05-Exercises/exercises.md`

## Free legal practice grounds
| Site | Notes |
|------|-------|
| **OWASP Juice Shop** | Modern vulnerable web app (run locally with Docker/npm) — the best all-round trainer |
| **PortSwigger Web Security Academy** | Free, world-class labs + tutorials (portswigger.net/web-security) |
| **DVWA** (Damn Vulnerable Web App) | Classic PHP practice app |
| **TryHackMe / HackTheBox** | Guided rooms and CTF machines |
| **OWASP WebGoat** | Lessons with built-in vulnerabilities |
