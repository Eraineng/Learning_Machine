# Lesson 4 — Integrating with External Services

📂 Code: `integration-project/tests/03-external-service.test.ts`, `tests/helpers/fakeNotifyServer.ts`

## The problem with real third-party services in tests
- 💸 Cost (SMS, payments)
- 🐌 Slow and **flaky** (network, rate limits)
- 🚫 You can't make them fail on purpose ("give me a 503 now")
- 🔐 Needs secrets in CI
- 📧 Side effects (real emails to real people!)

## Options, from most to least realistic
| Option | Description | Tools |
|--------|-------------|-------|
| **Vendor sandbox** | Provider's test environment | Stripe test mode, PayPal sandbox |
| **Fake HTTP server** | Real HTTP server you control | Our `fakeNotifyServer`, **WireMock**, **MockServer**, Mountebank |
| **Network-level mocking** | Intercept `fetch`/HTTP inside the process | **MSW** (Mock Service Worker), **nock** |
| **Mock the client class** | Replace `Notifier` with `vi.fn()` | Unit-test level: doesn't test HTTP at all |

Our project uses a **fake HTTP server**, so the real `Notifier` code runs: real `fetch`, real JSON serialization, real timeout handling.

## What to test at the integration point
1. **Request correctness:** URL, method, headers, body format
   ```ts
   expect(notify.received).toEqual([{ channel: 'ann', message: 'Task #1 "Ship release" completed' }]);
   ```
2. **Response handling:** success, and fields parsed correctly
3. **Error handling (resilience):**
   | Scenario | Expected behavior |
   |----------|-------------------|
   | 4xx/5xx from the service | Graceful, logged, main feature still works |
   | Timeout / slow response | Gives up after N ms, doesn't hang |
   | Service completely down | Connection refused handled |
   | Invalid/unexpected response body | Doesn't crash |
   | Retries | Retries the right number of times, with backoff |
4. **Business rules about when calls happen:** e.g. no notification if the task was already done

## WireMock (popular in Java/any language, runs as a standalone server)
```json
// stub mapping: POST /notify → 503
{
  "request":  { "method": "POST", "url": "/notify" },
  "response": { "status": 503, "fixedDelayMilliseconds": 1000 }
}
```
Then verify: `POST /__admin/requests/count` with a matcher → how many calls were received.

## MSW example (intercept fetch inside the test process)
```ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('https://notify.example.com/notify', () => HttpResponse.json({ sent: true })),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// in a test: override to simulate failure
server.use(http.post('*/notify', () => new HttpResponse(null, { status: 503 })));
```

## Fakes can lie
A fake only behaves how **you think** the real service behaves. If the provider changes their API, your tests still pass while production breaks.
Mitigations:
- A few **smoke tests against the real sandbox** (e.g. nightly)
- **Contract testing**: consumer and provider agree on a verified contract → `10-Contract-Testing`
- Record real responses and replay them (VCR-style, e.g. Polly.js)

## Messaging systems (Kafka, RabbitMQ, SQS)
Same ideas apply:
- Use a real broker in a container (Testcontainers) or an in-memory broker
- Test publish → message format, and consume → correct side effect
- Test poison messages, retries, dead-letter queues, duplicate delivery (idempotency)

## Try it
1. Add a `'badjson'` mode to the fake server that returns `200` with body `not json`. Does the app still work?
2. Add a retry to `Notifier` (up to 3 attempts on 5xx). Add a fake server mode that fails twice then succeeds, and assert `notify.received` has 3 entries.
3. Add a test proving **no** request is sent when only the title is updated.
4. Install `msw` and rewrite one test using network-level mocking instead of the fake server. Compare the two approaches.
