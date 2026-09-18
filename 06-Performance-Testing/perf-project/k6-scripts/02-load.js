// LOAD test: expected normal traffic. Ramp up → hold → ramp down.
// Run: k6 run k6-scripts/02-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // ramp up to 50 users
    { duration: '1m', target: 50 }, // stay at 50 users
    { duration: '15s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% errors
    http_req_duration: ['p(95)<250', 'p(99)<500'],
    'http_req_duration{name:product-detail}': ['p(95)<150'], // per-request threshold via tag
  },
};

export default function () {
  const list = http.get(`${BASE}/api/products?page=${1 + Math.floor(Math.random() * 5)}`, {
    tags: { name: 'product-list' },
  });
  check(list, { 'list 200': (r) => r.status === 200 });
  sleep(Math.random() * 2 + 1); // 1–3s think time

  const id = 1 + Math.floor(Math.random() * 50);
  const detail = http.get(`${BASE}/api/products/${id}`, { tags: { name: 'product-detail' } });
  check(detail, { 'detail 200': (r) => r.status === 200 });
  sleep(1);
}
