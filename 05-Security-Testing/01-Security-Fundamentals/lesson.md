# Lesson 1 — Security Fundamentals

## The CIA triad
| Principle | Meaning | Broken when… |
|-----------|---------|--------------|
| **Confidentiality** | Only authorized people see data | A data breach leaks passwords |
| **Integrity** | Data isn't changed without authorization | An attacker edits an order's price |
| **Availability** | The system is up when needed | A DDoS attack takes the site down |

Security testing checks that all three hold, even against someone actively trying to break them.

## Key terms
| Term | Meaning |
|------|---------|
| **Asset** | Something worth protecting (data, service, reputation) |
| **Threat** | A potential cause of harm (an attacker, malware) |
| **Vulnerability** | A weakness that a threat can exploit |
| **Exploit** | Code/technique that uses a vulnerability |
| **Risk** | Likelihood × impact of a threat exploiting a vulnerability |
| **Attack surface** | All the points where an attacker could get in |
| **Threat actor** | Who attacks: script kiddies, criminals, insiders, nation-states |
| **CVE** | A publicly catalogued known vulnerability (e.g. CVE-2021-44228, Log4Shell) |
| **CVSS** | 0–10 severity score for a vulnerability |
| **Zero-day** | A vulnerability with no fix available yet |

## Core security principles (build these in)
1. **Defense in depth** — many layers, so one failure isn't fatal (e.g. escape output *and* send a CSP header)
2. **Least privilege** — give each user/service the minimum access it needs
3. **Fail securely** — on error, deny access; don't leak details
4. **Never trust user input** — validate/sanitize everything from outside (including headers, cookies, URLs)
5. **Secure by default** — the safe option is the default
6. **Minimize attack surface** — remove unused features, endpoints, accounts
7. **Don't rely on obscurity** — hiding a URL is not access control

## Types of security testing
| Type | What | Who |
|------|------|-----|
| **SAST** (static) | Scan source code for vulnerable patterns | Devs, CI |
| **DAST** (dynamic) | Attack the running app from outside | QA, security team, ZAP/Burp |
| **SCA** (software composition) | Scan dependencies for known CVEs | `npm audit`, Dependabot, Snyk |
| **Penetration test** | Skilled human simulates a real attack, within scope | Pentesters |
| **Vulnerability scan** | Automated tool lists known issues | Nessus, OpenVAS |
| **Security code review** | Humans read code for security flaws | Devs, AppSec |
| **Red team** | Goal-based, stealthy, whole-org simulation | Specialists |
| **Threat modeling** | Design-time: "how could this be attacked?" | Whole team |

## Where testers fit in
You don't need to be a hacker to add huge value:
- Add **negative security tests** to your automated suite (this folder!)
- Try the "evil user" inputs during functional testing: SQL/XSS payloads, other users' IDs, tampered prices
- Check that errors don't leak stack traces, that HTTPS is enforced, that logout really works
- Run `npm audit` / dependency scans
- Verify access control: log in as a low-privilege user and try admin actions

## Threat modeling with STRIDE
Ask, for each part of the system:
| Letter | Threat | Example | Defense |
|--------|--------|---------|---------|
| **S** | Spoofing identity | Pretending to be another user | Strong authentication |
| **T** | Tampering | Changing data in transit or storage | Integrity checks, HTTPS |
| **R** | Repudiation | "I never did that" | Audit logs |
| **I** | Information disclosure | Leaking data | Encryption, access control |
| **D** | Denial of service | Overloading the system | Rate limiting, scaling |
| **E** | Elevation of privilege | User becomes admin | Authorization checks |

## The Shift-Left idea
Fixing a security bug in design costs almost nothing; fixing it after a breach costs millions and reputation. So build security in from the start and test continuously (**DevSecOps**).

## Check yourself
1. Give an example of breaking each part of the CIA triad.
2. What's the difference between a vulnerability and an exploit?
3. SAST vs DAST?
4. Which STRIDE threat is "a normal user becomes admin"?
