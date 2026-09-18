# Lesson 1 — Advanced Test Design Techniques

Recap from folder 00: equivalence partitioning, boundary values, decision tables, state transition, error guessing.
Now the techniques you reach for on bigger, messier systems.

## 1. Pairwise / combinatorial testing
📂 `tools/pairwise.mjs`

**Problem:** 3 browsers × 4 OS × 5 payment methods × 2 currencies × 2 login states = **240** combinations.

**Insight from field research:** the large majority of defects are triggered by a **single value** or an
**interaction between two values**. Three-way and higher interactions cause relatively few.

**Solution:** cover every *pair* of values at least once → **21** test cases (91% fewer), all 99 pairs covered.

```powershell
node tools/pairwise.mjs        # or: node pairwise.mjs my-params.json
```
Tools: **PICT** (Microsoft, supports constraints), `allpairspy`, Hexawise, our script.

**Constraints matter:** Safari doesn't run on Android, crypto may be unavailable in some currencies.
Real tools let you express `IF [os] = "Android" THEN [browser] <> "Safari"`.

**Always add manually:** business-critical combinations, known-risky combos, and anything a customer complained about.

## 2. State transition testing (advanced)
Beyond happy paths, test the **invalid** transitions and the **N-1 switch** coverage.

> Order states: `Pending → Paid → Shipped → Delivered`, `Cancelled` from Pending/Paid only.

| Coverage level | Meaning | Example |
|----------------|---------|---------|
| **All states** | Every state reached | weakest |
| **All transitions** (0-switch) | Every arrow taken | ⭐ the usual target |
| **All invalid transitions** | Every arrow that must NOT work | cancel a Delivered order → error |
| **1-switch** | Every *pair* of consecutive transitions | Paid→Shipped→Delivered |

Invalid transitions are where real money-losing bugs live (refunding a cancelled order twice, shipping an unpaid order).

## 3. Decision tables for complex business rules
When rules combine, build the table, then **collapse** impossible/irrelevant rules.
```
Conditions              R1  R2  R3  R4
Premium member          Y   Y   N   N
Order ≥ $50             Y   N   Y   N
────────────────────────────────────────
Free shipping           ✅  ✅  ✅  ❌
10% discount            ✅  ❌  ❌  ❌
```
With *n* conditions there are 2ⁿ rules. Use "don't care" (–) to merge rules that give the same outcome.

## 4. Use case / scenario testing
Test complete **user journeys**, not isolated functions, including alternate and exception flows.
```
Main flow:      browse → add to cart → checkout → pay → confirmation
Alternate:      apply coupon · change quantity · save for later
Exception:      card declined · out of stock at payment time · session expires mid-checkout
```
This finds integration and state bugs that unit-style cases miss.

## 5. CRUD matrix
For every entity, check every operation — and the interactions between them:
| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Order | ✅ | ✅ | ✅ | ⚠️ soft delete only | Delete a shipped order? |
| User | ✅ | ✅ | ✅ | ⚠️ GDPR erasure | What happens to their orders? |

Great for finding forgotten cases: "what happens to a product in someone's cart when an admin deletes it?"

## 6. Syntax testing & fuzzing
For structured inputs (dates, IBANs, JSON, file uploads): generate valid forms, then systematically corrupt them
(missing parts, wrong separators, extra fields, huge values, wrong encodings).

## 7. Exploratory testing with charters (structured, not random)
```
CHARTER: Explore the coupon system with expired and stacked coupons
         using an account with an existing order
         to discover pricing and rounding defects.
TIMEBOX: 45 minutes
```
**Session-based test management (SBTM)**: timeboxed sessions, a charter, notes, bugs found, and a debrief.
Exploratory testing is where the *unexpected* bugs are found — automation only checks what you already thought of.

**Tours** (heuristics for what to explore): the Money Tour (features that earn revenue), the Landmark Tour
(key features in odd orders), the Antisocial Tour (do everything wrong), the Obsessive-Compulsive Tour
(repeat actions, double-click, go back).

## 8. Heuristics and mnemonics worth memorizing
- **SFDIPOT** (San Francisco Depot): Structure, Function, Data, Interfaces, Platform, Operations, Time
- **CRUSSPIC STMPL**: quality attributes — Capability, Reliability, Usability, Scalability, Security, Performance, Installability, Compatibility + Supportability, Testability, Maintainability, Portability, Localizability
- **RIMGEA** for bug reporting: Replicate, Isolate, Maximize, Generalize, Externalize, And say it clearly
- **Zero One Many**: test with 0, 1 and many items (empty cart, 1 item, 1000 items)
- **Goldilocks**: too small, just right, too big

## Try it
1. Run `node tools/pairwise.mjs`. Then create `my-params.json` for a form you know and run it on that.
2. Draw the state diagram for a subscription (trial → active → past_due → cancelled) and list all **invalid** transitions.
3. Build a decision table for a loan approval with 4 conditions. How many rules? Which can be merged?
4. Write 3 exploratory charters for saucedemo and run one for 30 minutes. What did you find that automation wouldn't?
