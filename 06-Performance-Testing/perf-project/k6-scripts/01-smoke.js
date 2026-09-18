// SMOKE test: minimal load, just proves the script and system work.
// Run: k6 run k6-scripts/01-smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  vus: 2, // 2 virtual users
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate==0'], // no errors at all
    http_req_duration: ['p(95)<300'], // 95% of requests under 300ms
  },
};

export default function () {
  const res = http.get(`${BASE}/api/products`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns 10 products': (r) => r.json().length === 10,
  });

  sleep(1); // think time
}
