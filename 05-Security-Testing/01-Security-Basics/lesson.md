# Lesson 1 — Security Testing Basics

## The CIA triad: what we protect
| | Meaning | Attack example |
|--|---------|----------------|
| **Confidentiality** | Only authorized people can read data | Data breach, IDOR |
| **Integrity** | Data can't be changed without authorization | Changing an order price, SQL injection |
| **Availability** | System is usable when needed | DoS attack, resource exhaustion |

Plus: **Authentication** (who are you?), **Authorization** (what may you do?), **Non-repudiation** (proof of who did what: audit logs).

## Key vocabulary
| Term | Meaning |
|------|---------|
| **Vulnerability** | A weakness (e.g. unescaped input) |
| **Threat** | Something that could exploit it (e.g. an attacker) |
| **Exploit** | The actual technique/code that uses the weakness |
| **Risk** | Likelihood × impact |
| **Attack surface** | All the places input enters the system: forms, APIs, headers, cookies, files, URLs |
| **CVE** | Public ID for a known vulnerability (CVE-2021-44228 = Log4Shell) |
| **CVSS** | Severity score 0–10 |
| **Zero-day** | Vulnerability with no fix available yet |
| **Defense in depth** | Multiple layers (validation + escaping + CSP + WAF) |
| **Least privilege** | Give only the permissions that are needed |

## Types of security testing
| Type | What | When | Examples |
|------|------|------|----------|
| **SAST** (Static) | Analyze **source code** without running it | Every commit | Semgrep, SonarQube, CodeQL |
| **DAST** (Dynamic) | Attack the **running app** from outside | Test environment | OWASP ZAP, Burp Suite |
| **SCA** (Software Composition) | Find vulnerable **dependencies** | Every build | `npm audit`, Snyk, Dependabot |
| **Secret scanning** | Find passwords/keys committed to git | Every commit | gitleaks, GitHub secret scanning |
| **IAST** | Agent inside the running app watches for issues during tests | Test runs | Contrast |
| **Penetration testing** | Skilled humans attack like real hackers | Before release / yearly | Manual + tools |
| **Vulnerability scanning** | Automated scan of servers/networks for known issues | Regularly | Nessus, OpenVAS, Nmap |
| **Security code review** | Humans review code for security flaws | PRs | Checklists |
| **Automated security tests** | Regression tests for security rules (like our tests!) | CI | supertest, Playwright |

### Box types
- **Black-box:** the tester knows nothing, like an outside attacker
- **Grey-box:** some knowledge (a user account, API docs)
- **White-box:** full code access, most thorough

## Shift-left security (DevSecOps)
```
Design → Code → Build → Test → Deploy → Operate
  │        │       │       │       │        │
Threat   SAST    SCA +   DAST +  Config   Monitoring,
modeling secrets  SBOM   pentest scanning  bug bounty
```
Fixing a security flaw in design costs minutes. Fixing it after a breach costs millions, plus trust.

## Threat modeling: think like an attacker
Ask 4 questions (Shostack):
1. **What are we building?** Draw a data-flow diagram
2. **What can go wrong?** Use STRIDE
3. **What are we going to do about it?**
4. **Did we do a good job?**

### STRIDE
| Threat | Violates | Example | Test idea |
|--------|----------|---------|-----------|
| **S**poofing | Authentication | Log in as someone else | Stolen/forged tokens, SQL injection login bypass |
| **T**ampering | Integrity | Change price in the request | Modify hidden fields/JSON, replay requests |
| **R**epudiation | Non-repudiation | "I never made that transfer" | Are actions logged with user + time? |
| **I**nformation disclosure | Confidentiality | Read others' data | IDOR, verbose errors, data in responses |
| **D**enial of service | Availability | Crash or overload | Huge inputs, many requests, regex DoS |
| **E**levation of privilege | Authorization | User becomes admin | Mass assignment, missing role checks |

## The tester's security mindset
Normal tester: "Does it work with valid input?"
Security tester: **"What happens if I send something the developer didn't expect?"**
- Change IDs in URLs: `/orders/2` → `/orders/1`
- Remove, duplicate, or add fields in requests: `"role": "admin"`, `"price": -1`
- Skip steps: go straight to `/checkout/confirm`
- Replay requests; send them twice at the same time (race conditions)
- Use a different user's token, an expired token, or no token
- Put code in every input: `'`, `<script>`, `{{7*7}}`, `../../etc/passwd`

## Check yourself
1. Which CIA property does IDOR violate? Which does DoS violate?
2. What's the difference between SAST and DAST?
3. Apply STRIDE to a "reset password by email" feature: one threat per letter.
