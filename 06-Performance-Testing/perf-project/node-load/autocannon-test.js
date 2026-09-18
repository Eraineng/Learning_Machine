// Quick HTTP benchmark with autocannon (pure npm, no install beyond `npm install`).
// Start the server first: npm run server
import autocannon from 'autocannon';

const url = process.env.TARGET ?? 'http://localhost:3333/api/products';

const result = await autocannon({
  url,
  connections: 50, // concurrent connections (≈ virtual users)
  duration: 10, // seconds
});

console.log(autocannon.printResult(result));

// Simple pass/fail "thresholds", like k6
const p99 = result.latency.p99;
const errors = result.errors + result.non2xx;
console.log(`p99 latency: ${p99} ms, errors: ${errors}, avg req/sec: ${result.requests.average}`);

if (p99 > 500 || errors > 0) {
  console.error('❌ Performance thresholds FAILED');
  process.exit(1);
}
console.log('✅ Performance thresholds passed');
