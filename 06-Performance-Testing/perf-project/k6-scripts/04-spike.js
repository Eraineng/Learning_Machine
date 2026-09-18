// SPIKE test: sudden huge jump in traffic (flash sale, TV ad, viral post).
// Run: k6 run k6-scripts/04-spike.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // normal
    { duration: '5s', target: 300 }, // SPIKE!
    { duration: '30s', target: 300 },
    { duration: '5s', target: 10 }, // back to normal
    { duration: '20s', target: 10 }, // recovery check
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const res = http.get(`${BASE}/api/products`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.5);
}
