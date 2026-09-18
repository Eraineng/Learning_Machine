# Lesson 4 — Test Design Basics

We can't test everything (principle 2), so we use **techniques** to pick the fewest tests that
find the most bugs.

Running example requirement:
> **Age field:** accepts whole numbers from **18 to 60** (inclusive). Otherwise show "Invalid age".

## 1. Equivalence Partitioning (EP)
Split inputs into groups (**partitions**) that the system should treat the same way. Test **one value per group**.

| Partition | Range | Valid? | Pick |
|-----------|-------|--------|------|
| Too small | < 18 | ❌ | `10` |
| Valid | 18–60 | ✅ | `35` |
| Too big | > 60 | ❌ | `75` |
| Not a number | letters, symbols | ❌ | `abc` |
| Empty | "" | ❌ | (blank) |
| Not whole | decimals | ❌ | `25.5` |

That's 6 tests instead of thousands.

## 2. Boundary Value Analysis (BVA)
Bugs love edges: developers write `>` instead of `>=`. Test **on and around each boundary**.

```
   17 | 18  19  ...  59  60 | 61
  ❌  | ✅                ✅ | ❌
```
| Value | Expected |
|-------|----------|
| 17 | Invalid |
| 18 | Valid |
| 19 | Valid (optional) |
| 59 | Valid (optional) |
| 60 | Valid |
| 61 | Invalid |

**EP + BVA together** is the most common combo in real work.

## 3. Decision Table
Use it when **combinations of conditions** lead to different results.

> Requirement: free shipping if the order is **≥ $50** OR the customer is **Premium**.
> Premium customers with orders ≥ $50 also get a **10% discount**.

| Rule | 1 | 2 | 3 | 4 |
|------|---|---|---|---|
| **Order ≥ $50** | Y | Y | N | N |
| **Premium member** | Y | N | Y | N |
| → Free shipping | ✅ | ✅ | ✅ | ❌ |
| → 10% discount | ✅ | ❌ | ❌ | ❌ |

Each column is one test case. With 2 conditions there are 2² = 4 rules; with 3 conditions there are 8.

## 4. State Transition
Use it when the system behaves differently depending on its **current state**.

> Requirement: an account locks after **3 wrong passwords** in a row.

```
[Active] --wrong--> [1 fail] --wrong--> [2 fails] --wrong--> [Locked]
   ^                   |                    |
   └──── correct ──────┴──── correct ───────┘
```
Tests:
- wrong, wrong, correct → logged in and the counter resets
- wrong ×3 → locked
- locked + correct password → still locked (**invalid transition**, easy to forget!)

## 5. Error Guessing
Use experience to guess where bugs hide. A classic checklist:
- Empty / only spaces / very long input
- Special characters: `' " < > & ; %`, emoji 😀, non-English text (`日本語`, `Ñ`)
- Zero, negative numbers, huge numbers
- Leading/trailing spaces: `" admin "`
- Double-clicking submit
- Back button after submit
- Two tabs doing the same thing
- Dates: Feb 29, Dec 31 → Jan 1, time zones
- Slow or no network

## 6. Test Scenario vs Test Case
| | Scenario | Test case |
|--|----------|-----------|
| Level | High-level: *what* to test | Detailed: *how* to test |
| Example | "Verify login functionality" | "Login with valid email + wrong password shows 'Invalid credentials'" |
| Count | 1 scenario | → many test cases |

## Practice: apply to a password rule
> Password must be **8–20 characters** and contain **at least 1 digit**.

Try it before looking:
1. EP partitions for length?
2. BVA values for length?
3. Decision table for (length OK?, has digit?)

<details>
<summary>Answer</summary>

1. Length < 8 ❌, 8–20 ✅, > 20 ❌ (plus empty)
2. 7, 8, 20, 21
3. | Length OK | Y | Y | N | N |
   |-----------|---|---|---|---|
   | Has digit | Y | N | Y | N |
   | Accepted  | ✅ | ❌ | ❌ | ❌ |

</details>
