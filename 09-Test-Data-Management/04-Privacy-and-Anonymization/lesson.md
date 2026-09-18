# Lesson 4 — Privacy, Anonymization and Synthetic Data

📂 Code: `data-project/src/anonymize.ts`, `tests/04-anonymization.test.ts`

## Why this matters to testers
Copying the production database into a test environment is the oldest trick in QA — and one of the most
common privacy violations. Test environments typically have weaker access control, more people with access,
and data that ends up in screenshots, bug reports, logs and laptops.

Laws: **GDPR** (EU), **CCPA** (California), **HIPAA** (US health), **PCI-DSS** (card data), and more.
Fines are real (GDPR: up to 4% of global annual revenue).

## Terms
| Term | Meaning | Reversible? |
|------|---------|-------------|
| **Anonymization** | Data can no longer identify a person, at all | ❌ (that's the point) |
| **Pseudonymization** | Identifiers replaced by tokens; re-identifiable with a key | ✅ with the key → still personal data under GDPR |
| **Masking** | Hide part of a value: `j****h@example.com`, `****1111` | ❌ partial |
| **Synthetic data** | Generated, never belonged to anyone | n/a ⭐ safest |
| **Subsetting** | Take a small, representative slice (1% of rows) | n/a |

## Deterministic pseudonymization (and why)
```ts
const pseudo = (value) => sha256(salt + value).slice(0, 10);
email: `user_${pseudo(user.email)}@anonymized.test`
```
Because the same input always yields the same output:
- `users.email` and `orders.customer_email` still **match** → joins and reports still work
- Test scenarios that rely on "the same customer" still behave correctly

Keep the **salt secret** — without it, an attacker could hash a list of known emails and re-identify people.

## What counts as PII
Direct: name, email, phone, address, national id, card number, photo, IP, device id, precise location.
Indirect (quasi-identifiers): date of birth + postcode + gender can identify most individuals.
⚠️ Anonymizing only names is **not enough**: rare combinations (job title + company + city) re-identify people.
Also consider **free-text fields** (support tickets often contain names, phone numbers and card numbers).

## Practical rules for testers
1. **Prefer synthetic data.** Use faker + factories (lesson 2) rather than production copies.
2. If you must copy production: anonymize **during export**, never "later in the test environment".
3. Never paste real data into bug reports, tickets, Slack, or a screenshot. Mask it.
4. Never use real email addresses in tests — use `@test.example` / `@example.com`.
5. Scan fixtures for PII before committing (`findPii` in this project; `gitleaks` for secrets).
6. Keep test data retention short; delete environments and dumps you don't need.
7. Card data (PCI): use the provider's official **test card numbers**, never real ones.

## Production-like without production data
For realistic testing you usually need volume and distribution, not real people:
- Generate 1M synthetic users with faker
- Copy the **shape**: same distributions of plan types, order sizes, name lengths, locales
- Include the nasty cases production has: unicode names, very long addresses, missing optional fields, old records

## Sanity tests for your anonymization
Our tests show what to verify:
- No original value survives anywhere (`not.toContain('john.smith')`)
- Non-personal fields are preserved (data stays useful)
- Deterministic mapping (referential integrity)
- Different people → different pseudonyms (no collisions)
- A PII scanner finds nothing in the result

## Try it
1. Add address and date-of-birth anonymization (generalize DOB to just the year).
2. Extend `findPii` to detect IBANs and IPv4 addresses. Test with both valid and near-miss strings.
3. Write a test that scans **all** files in `data/` for PII and fails if any is found. Add it to CI.
4. Read your company's (or a public) data retention policy and note what it says about test environments.
