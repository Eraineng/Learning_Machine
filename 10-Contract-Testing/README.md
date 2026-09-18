# Contract Testing — Learning Roadmap

In a microservices world, the classic question is: *"How do I know service A still works with service B,
without deploying both and running slow end-to-end tests?"*

**Contract testing** is the answer: the consumer writes down exactly what it needs, and the provider proves
it still delivers that — **independently**, in each team's own pipeline, in milliseconds.

```
contract-project/
├── src/
│   ├── contract.ts             a mini Pact: matchers (like/term/eachLike) + a verifier
│   ├── consumer/userClient.ts  CONSUMER: the web app's user-service client
│   └── provider/userService.ts PROVIDER: the user-service API (v1 and a breaking v2)
├── contracts/                  generated contract file (the "pact")
└── tests/
    ├── 01-consumer.test.ts          consumer tests against a mock provider → writes the contract
    ├── 02-provider-verification.test.ts  replays the contract against the real provider
    └── 03-breaking-change.test.ts   provider v2 breaks the contract → caught before deploy
```

## Setup
```powershell
cd contract-project
npm install
npm run test:consumer     # generates contracts/web-app-user-service.json
npm test                  # consumer + provider verification + breaking-change demo
```

Open `contracts/web-app-user-service.json` after the first run — that file *is* the contract.

## Checklist
- [ ] `01-Why-Contract-Testing/lesson.md`: the integration problem, consumer-driven contracts
- [ ] `02-Hands-On-Flow/lesson.md`: the 3 steps, matchers, provider states
- [ ] `03-Pact-and-Real-World/lesson.md`: Pact JS, Pact Broker, can-i-deploy, CI
- [ ] `04-Exercises/exercises.md`
