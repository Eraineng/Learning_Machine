# Topic 3 — Penetration Testing ⭐

**Hands-on companion:** [`../../05-Security-Testing/`](../../05-Security-Testing/) (41 attack/defence tests)
**Authorization first:** pentesting without **written permission** is a crime. Always.

## Definition (say it like this)
> "A penetration test is an **authorized, simulated attack** on a system, performed by skilled humans, to find
> and **exploit** vulnerabilities the way a real attacker would — and then prove the business impact.
> It's goal-driven and manual-first, which is what separates it from an automated scan."

## ⭐ Pentest vs vulnerability scan (the most common follow-up)
| | Vulnerability scan | Penetration test |
|--|-------------------|------------------|
| **Who/what** | Automated tool (Nessus, OpenVAS, ZAP baseline) | Skilled human (+ tools) |
| **Does it exploit?** | ❌ Detects *potential* issues | ✅ Exploits to prove real impact |
| **Depth** | Broad, shallow, signature/CVE-based | Deep, creative, chains weaknesses together |
| **Business logic flaws** | ❌ Misses them | ✅ Its speciality (price tampering, BOLA, workflow abuse) |
| **False positives** | Many | Few — findings are proven |
| **Duration / cost** | Minutes–hours, cheap, continuous | Days–weeks, expensive, periodic |
| **Output** | List of alerts by CVSS | Narrative report: attack path, impact, evidence, remediation |

> One-liner: **"A scanner tells you the door might be unlocked; a pentester walks in and shows you what they took."**

Related: a **vulnerability assessment** = scan + human triage/prioritization, without exploitation.
A **red team** exercise goes further: goal-based ("exfiltrate customer data"), stealthy, tests detection & response too.

## ⭐ Black box / White box / Grey box
| | Knowledge given | Simulates | Pros | Cons |
|--|-----------------|-----------|------|------|
| **Black box** | Nothing — just a URL/IP | An external attacker with no inside info | Realistic; unbiased | Slow (lots of recon); may miss deep flaws; coverage depends on luck |
| **White box** (clear/crystal box) | Full access: source code, architecture, credentials, configs | A malicious insider, or a thorough audit | Most thorough; finds issues in rarely reached code; efficient | Less realistic as an attack simulation; needs more time to review |
| **Grey box** | Partial: user credentials, API docs, maybe some architecture | A registered user or a partner who abuses access | ⭐ Best value in practice: skips useless recon, tests authorization properly | Scope must be defined carefully |

> "**Grey box is what most engagements actually are** — the tester gets two user accounts and the API docs,
> which is exactly what's needed to test broken object level authorization: log in as user A and try to read
> user B's data."

That's precisely the BOLA test in our flight-booking lab (`../flight-booking-lab/tests/02-security-negative.test.js`).

## ⭐ The standard phases (PTES / EC-Council wording)
```
1. Pre-engagement  → scope, rules of engagement, authorization letter, timing, contacts, "get out of jail" card
2. Reconnaissance  → passive (OSINT, DNS, LinkedIn, leaked creds) + active (port scan, tech fingerprinting)
3. Scanning / Enumeration → map the attack surface: ports, services, endpoints, parameters, users, versions
4. Vulnerability analysis → identify candidate weaknesses, map to CVEs and logic flaws
5. Exploitation    → gain access; prove the vulnerability is real
6. Post-exploitation → privilege escalation, lateral movement, persistence, data access = the real IMPACT
7. Reporting       → executive summary + technical detail: steps, evidence, risk rating, remediation
8. Remediation & re-test → verify the fixes actually work
```
Memory hook: **Plan → Recon → Scan → Analyse → Exploit → Escalate → Report → Re-test**

### What goes in the report
Executive summary (business risk, no jargon) · findings ranked by **CVSS** and business impact ·
reproduction steps + evidence · affected assets · concrete remediation advice · re-test results.

## Where a QA tester fits
You're usually **not** the pentester, but you should:
- Write **negative security tests** in the regression suite (folder 05 does exactly this)
- Run dependency/secret scans (`npm audit`, gitleaks) and DAST baselines (ZAP) in CI
- Test authorization matrices: for every endpoint × every role × another user's object
- Validate that pentest findings are **fixed and stay fixed** (add a regression test per finding)
- Feed findings into the risk matrix (folder 15)

## Quick-fire Q&A
| Question | Answer |
|----------|--------|
| "Pentest vs vulnerability scan?" | Scan = automated detection of known issues; pentest = authorized human exploitation proving real impact, including business-logic flaws |
| "Which box type would you choose?" | Grey box for most web/API work: realistic attacker-with-an-account, without wasting days on recon |
| "What's the first phase?" | Pre-engagement: scope and **written authorization** — never touch anything before that |
| "Name a business logic flaw a scanner can't find" | Price tampering, BOLA/IDOR, booking negative seats, skipping a payment step in a workflow |
| "What's OWASP Top 10?" | The standard list of the most critical web risks — A01 Broken Access Control, A02 Crypto Failures, A03 Injection, … (folder 05) |
| "How do you test authorization?" | Two accounts, one admin: for every object endpoint, try another user's id; expect 404/403 and confirm no data leaks |
| "What is CVSS?" | A 0–10 severity scoring standard used to prioritize findings |

## Practice
```powershell
cd ../../05-Security-Testing/security-project && npm install && npm test   # 41 tests
cd ../flight-booking-lab && npm test                                        # BOLA + price tampering proven
```
1. Write the "rules of engagement" for a pentest of the flight-booking API (scope, timing, exclusions, contacts).
2. Do 3 free labs on PortSwigger Web Security Academy (SQLi, XSS, access control) and write up one as a finding.
3. For each OWASP Top 10 item, name one concrete test you'd run against a flight booking site.
