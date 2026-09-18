// STRESS test: keep increasing load beyond normal to find the BREAKING POINT.
// Watch where latency explodes or errors start. Run: k6 run k6-scripts/03-stress.js
import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  stages: [
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '20s', target: 200 },
    { duration: '20s', target: 400 },
    { duration: '20s', target: 0 }, // recovery: does the system come back to normal?
  ],
  thresholds: {
    // abortOnFail: stop the test once the system is clearly broken
    http_req_duration: [{ threshold: 'p(95)<2000', abortOnFail: true, delayAbortEval: '10s' }],
  },
};

export default function () {
  const res = http.get(`${BASE}/api/products`);
  check(res, { 'status 200': (r) => r.status === 200 });
  // no sleep → maximum pressure
}
