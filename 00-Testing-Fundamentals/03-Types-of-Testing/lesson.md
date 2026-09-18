# Lesson 3 — Types of Testing

Test **levels** (lesson 2) say *where* in the system you test.
Test **types** say *what* you test for. Any type can happen at any level.

## 1. Functional vs Non-functional
| Functional: **what** it does | Non-functional: **how well** it does it |
|-------------------------------|-----------------------------------------|
| Login with valid password works | Login responds in under 1 second |
| Cart total is calculated correctly | Site handles 10,000 users at once |
| Search returns matching products | Screen reader can use the search box |

### Non-functional types
| Type | Question | Folder |
|------|----------|--------|
| **Performance** | Is it fast? | `05` |
| **Load** | Does it work under expected traffic? | `05` |
| **Stress** | When does it break under extreme traffic? | `05` |
| **Security** | Can it be attacked or data stolen? | `06` |
| **Usability** | Is it easy to use? | |
| **Accessibility** | Can people with disabilities use it? | `08` |
| **Compatibility** | Does it work on Chrome, Safari, mobile, Windows, Mac? | `02`, `07` |
| **Reliability** | Does it keep working over time? | |

## 2. Black-box vs White-box vs Grey-box
| | You know the code? | Based on | Example |
|--|--------------------|----------|---------|
| **Black-box** | No | Requirements, inputs/outputs | Testing a login page as a user |
| **White-box** | Yes | Code structure (branches, paths) | Making sure both sides of an `if` run |
| **Grey-box** | Partly | Some internal knowledge | API tests knowing the database schema |

## 3. Change-related testing
| Type | Purpose | When |
|------|---------|------|
| **Smoke** | "Does the build work at all?" Broad and shallow | Right after a new build/deploy |
| **Sanity** | "Does this specific fix/feature work?" Narrow and focused | After a small change or bug fix |
| **Re-testing (confirmation)** | Does the bug fix actually fix *that* bug? | After a developer fixes a bug |
| **Regression** | Did the change break anything *else*? | After any change, ideally automated |

Example: a developer fixes a bug where "Forgot password" emails weren't sent.
- **Smoke:** the app loads, login works, main pages open.
- **Re-test:** request a password reset and check the email arrives.
- **Sanity:** the reset link works and the new password can be set.
- **Regression:** login, signup and profile email changes still work.

> Regression tests run again and again, which makes them the #1 candidate for **automation**.

## 4. Manual vs Automated
| | Manual | Automated |
|--|--------|-----------|
| Good for | Exploratory, usability, one-time checks, new features | Regression, repetitive, data-heavy, API, CI/CD |
| Speed | Slow | Fast (after it's written) |
| Initial cost | Low | High (writing + maintaining code) |
| Human judgment | Yes ("this looks wrong") | No, only checks what you tell it |

Automation doesn't replace manual testing. Automate the boring, repetitive checks so humans can explore.

## 5. Scripted vs Exploratory
- **Scripted:** follow pre-written test cases step by step.
- **Exploratory:** design and run tests on the fly while learning the app. Use a **charter** such as "Explore the checkout with invalid coupons for 30 min to find pricing bugs."
- **Ad-hoc:** unplanned, no charter, no documentation.

## 6. Positive vs Negative
- **Positive:** valid input should succeed. Example: register with a valid email.
- **Negative:** invalid input should be handled gracefully. Examples: an empty email, `abc@`, a 500-character email, or SQL text like `' OR 1=1 --`.

Good testers write **more negative tests** than beginners expect, because that's where bugs hide.

## Check yourself
1. "Page loads in 2 seconds." Functional or non-functional?
2. New build deployed at 9am. What's the first type of testing you run?
3. Difference between re-testing and regression testing?
4. Name 3 things you'd rather test manually than automate.
