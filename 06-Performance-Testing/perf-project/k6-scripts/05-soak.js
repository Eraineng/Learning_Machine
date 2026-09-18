// SOAK (endurance) test: normal load for a LONG time.
// Finds memory leaks, connection leaks, disk filling up, slow degradation.
// Real soak tests run for hours. Shortened here. Run: k6 run k6-scripts/05-soak.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '10m', target: 30 }, // in real life: 2–12 hours
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  check(http.get(`${BASE}/api/products`), { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
