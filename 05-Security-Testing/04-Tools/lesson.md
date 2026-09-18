# Lesson 4 — Security Testing Tools

## Dependency scanning (SCA) — start here, it's free and easy
```powershell
npm audit                 # list known vulnerabilities in dependencies
npm audit --production    # only runtime deps
npm audit fix             # auto-upgrade where safe
```
- **Dependabot** / **Renovate**: auto-PRs for vulnerable/outdated deps (GitHub)
- **Snyk**, **OWASP Dependency-Check**, **Trivy**: deeper scanning, more ecosystems
- Put this in CI so a vulnerable dependency fails the build (→ `14-CI-CD-for-Testing`)

## SAST — scan your source code
Finds risky patterns (string-concatenated SQL, `eval`, hardcoded secrets) without running the app.
- **Semgrep** (`semgrep --config auto`), **CodeQL** (GitHub), **SonarQube**, ESLint security plugins
- Fast, runs in CI, but produces false positives

## Secret scanning
Hardcoded API keys/passwords in code or git history are a top cause of breaches.
- **gitleaks**, **truffleHog**, GitHub secret scanning
- If a secret leaks: **rotate it** (assume it's compromised), don't just delete the commit

## DAST — attack the running app
### OWASP ZAP (free, open source) — recommended for learning
- **Automated scan:** point it at a URL, it spiders and attacks
- **Manual proxy:** set your browser to use ZAP → it records and lets you tamper with every request
- **ZAP HUD** and the built-in scanner find XSS, SQLi, missing headers, etc.
- Has a CLI/Docker mode for CI: `zap-baseline.py -t https://your-app`

### Burp Suite — the industry-standard proxy
- **Community** (free) or **Pro** (paid). The pentester's main tool.
- **Proxy:** intercept and modify requests
- **Repeater:** resend a request with tweaks (great for testing IDOR, injection)
- **Intruder:** automated payload fuzzing (brute force, enumeration)
- **Decoder/Comparer:** encode/decode, diff responses

### How a proxy helps testing
Your browser → **proxy (ZAP/Burp)** → server. You can pause any request and change the price, the user ID, the role, or add an injection payload. This is how you find IDOR, mass assignment and injection by hand.

## Vulnerability scanners (infrastructure)
- **Nessus**, **OpenVAS**, **Qualys**: scan servers/networks for known CVEs and misconfigurations
- **nmap**: port scanning and service discovery (`nmap -sV localhost`) — only on your own machines
- **testssl.sh** / **SSL Labs**: check TLS/HTTPS configuration

## Fuzzing
Throw malformed/random/huge/boundary input at inputs to find crashes and unhandled cases: **ffuf**, **wfuzz**, or Burp Intruder. Ties directly to your negative testing skills from folder 00.

## Automated security tests in your suite
The `security-project/tests` are the model: write **negative security tests** that assert the app rejects attacks. Run them on every commit. They protect against regressions when someone "refactors" a query back into string concatenation.

## A practical testing workflow
1. **Recon:** map the app — endpoints, parameters, roles, tech stack
2. **SCA + SAST + secret scan:** cheap automated wins
3. **DAST baseline scan** (ZAP) on a test environment
4. **Manual testing** with a proxy for the logic bugs scanners miss (IDOR, business logic, access control)
5. **Targeted tests** per OWASP category
6. **Report:** each finding with severity (CVSS), reproduction steps, impact and remediation (reuse the bug report template in folder 00)
7. **Retest** after fixes

## Safe practice targets (never scan systems you don't own)
- This folder's `vuln` app
- OWASP Juice Shop, DVWA, WebGoat (run locally)
- PortSwigger Web Security Academy (hosted, legal, free)
- `scanme.nmap.org` (nmap's official practice host)

## Check yourself
1. SAST vs DAST vs SCA — one line each.
2. What does a proxy like Burp let you do that a browser alone can't?
3. A secret was committed to git. What's the first thing you do?
4. Why keep automated security tests in your normal test suite?
