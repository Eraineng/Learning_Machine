# Lesson 1 — CI/CD Fundamentals

## The words
| Term | Meaning |
|------|---------|
| **CI — Continuous Integration** | Every developer merges small changes to the main branch often (at least daily), and **every change is automatically built and tested** |
| **CD — Continuous Delivery** | Every change that passes the pipeline is **ready** to deploy; releasing is a business decision (one button) |
| **CD — Continuous Deployment** | Every change that passes is **automatically deployed** to production |
| **Pipeline** | The automated sequence: build → test → deploy |
| **Build / Run / Job / Step** | One execution of the pipeline; jobs run on machines (runners); steps are commands |
| **Artifact** | A file produced by a run: report, coverage, screenshots, binaries |
| **Quality gate** | A rule that stops the pipeline (coverage < 80%, critical vulnerabilities, failing tests) |

## Why it matters to testers
Before CI: "QA gets the build on Friday, tests for a week, finds 40 bugs, developers have forgotten the code."
With CI: a bug is found **minutes** after it's written, by the person who wrote it, when it's cheapest to fix.

Your automated tests are worthless sitting on your laptop. In the pipeline they become a **safety net for the
whole team** and the thing that lets the company release daily instead of quarterly.

## The feedback loop: speed is a feature
| Feedback time | Developer behavior |
|---------------|--------------------|
| < 2 min | Waits for it, fixes immediately |
| 10 min | Switches task, comes back |
| 1 hour | Merges other things meanwhile, context lost |
| Overnight | Nobody looks; failures accumulate; the pipeline is ignored |

That's why pipelines are **staged**: cheap tests first, expensive ones later (see lesson 3).

## What runs when
| Trigger | Typical tests |
|---------|---------------|
| **Pre-commit hook** (local) | Lint, format, changed unit tests (seconds) |
| **Every push / PR** | Lint, typecheck, unit, integration, contract, a11y, a subset of E2E |
| **Merge to main** | Full E2E on staging, visual tests, build + deploy |
| **Nightly** | Full cross-browser E2E, performance, security scans, flaky hunt |
| **Before release** | Full regression, load test, manual exploratory session |
| **After deploy** | Smoke tests in production, synthetic monitoring |

## Core CI principles
1. **Single source of truth** — one main branch everyone integrates into
2. **Every commit triggers a build** — no "I'll run tests later"
3. **Keep the build green** — a broken main branch is an emergency for the whole team
4. **Fast pipeline** — aim for < 10 minutes for PR feedback
5. **Same pipeline for everyone** — no "works on my machine" deploys
6. **Reproducible** — pinned versions, `npm ci` (lock file) not `npm install`, containers
7. **Visible** — everyone can see the status and the reports

## Tools
| Tool | Notes |
|------|-------|
| **GitHub Actions** | ⭐ Most common today, YAML in the repo, huge marketplace |
| **GitLab CI** | Built into GitLab, `.gitlab-ci.yml`, strong environments/review apps |
| **Jenkins** | Old, self-hosted, ultra-flexible, still everywhere in enterprises |
| **Azure DevOps / CircleCI / TeamCity / Bitbucket Pipelines** | Same concepts, different YAML |

Learn the **concepts**; the YAML dialect is a detail you can look up.

## Check yourself
1. Continuous delivery vs continuous deployment?
2. Why does pipeline speed change developer behavior?
3. What should run on a pre-commit hook vs nightly?
4. Why `npm ci` instead of `npm install` in CI?
