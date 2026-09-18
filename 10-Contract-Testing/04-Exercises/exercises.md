# Contract Testing — Exercises

## Level 1 — Understand the flow
1. Run `npm run test:consumer`, then open `contracts/web-app-user-service.json`. Explain every field.
2. Run `npm test`. In your own words, what does each of the 3 test files prove?
3. In `userService.ts`, delete `internalNotes` from the v1 response. Does verification still pass? Why?
4. Now delete `email`. What's the failure message?

## Level 2 — Extend the contract
5. Add an interaction for `GET /users?plan=pro` returning only pro users. Implement it in the provider.
6. Add a `POST /users` interaction (201 + `Location` header). Verify request body matching too — you'll need to extend `verify()` to check the request side.
7. Add a second consumer (`mobile-app`) that needs `id`, `name` and `avatarUrl`. Generate its own contract file and verify the provider against **both** contracts. What must the provider add?

## Level 3 — Breaking changes
8. Make provider v3 that changes `id` from a number to a string. Which matcher catches it?
9. Make a change that is breaking for `web-app` but **not** for `mobile-app`. Show the verification results for each.
10. Change the 404 response body to `{ message: ... }` instead of `{ error: ... }`. Is that breaking? Who decides?

## Level 4 — Real tools
11. Install `@pact-foundation/pact` and rewrite the consumer test with `PactV3`.
12. Write the provider verification with Pact's `Verifier` and `stateHandlers`.
13. Run a Pact Broker in Docker, publish the pact, and view the matrix in its UI.
14. Write `can-i-deploy` steps for both pipelines.

## Level 5 — Design decisions
15. Your team owns a public API with thousands of unknown consumers. Would you use Pact? What instead? Write 5 sentences.
16. Draw (or list) which of your 4 existing projects in this repo would benefit from contract testing, and where the contracts would sit.
17. Write the team agreement: who writes contracts, when they're published, what happens when verification fails, and how a breaking change gets rolled out (hint: expand-and-contract / parallel change).

## Quiz
1. Who writes the contract in consumer-driven contract testing?
2. Why use `like(1)` instead of `1`?
3. What is a provider state and why is it needed?
4. Is adding a response field breaking? Is renaming one?
5. What does `can-i-deploy` answer?
6. Why don't contract tests replace functional tests of the provider?
7. Can a JS consumer verify against a Java provider?

<details><summary>Answers</summary>

1. The consumer — it declares what it needs; the provider must satisfy it.
2. Contracts check **types/shape**, not values. Real data differs from the example, so exact values cause false failures.
3. A named precondition ("user 1 exists"). The provider seeds that data before the interaction is replayed, so verification is deterministic.
4. Adding: not breaking. Renaming: breaking (it's a removal plus an addition).
5. Whether a specific version of a service can be safely deployed to an environment, based on verified contracts with all its consumers/providers.
6. They only verify the agreed interactions' shape, not that the provider's business logic is correct.
7. Yes — Pact's contract format is language-independent.

</details>
