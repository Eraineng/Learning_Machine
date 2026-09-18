// Realistic USER JOURNEY with groups, test data, custom metrics and scenarios.
// Run: k6 run k6-scripts/06-user-journey.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';

const BASE = __ENV.BASE_URL || 'http://localhost:3333';

// Test data loaded once and shared by all VUs (could also be open('./users.json'))
const users = new SharedArray('users', () =>
  Array.from({ length: 100 }, (_, i) => ({ username: `user${i}`, password: 'secret' })),
);

// Custom metrics
const loginTime = new Trend('login_duration', true);
const checkoutSuccess = new Rate('checkout_success');
const cartAdds = new Counter('cart_adds');

export const options = {
  scenarios: {
    // Browsers: most users just look around
    browsers: {
      executor: 'ramping-vus',
      exec: 'browse',
      stages: [
        { duration: '20s', target: 40 },
        { duration: '40s', target: 40 },
        { duration: '10s', target: 0 },
      ],
    },
    // Buyers: fixed ARRIVAL RATE (new iterations per second), independent of response time
    buyers: {
      executor: 'constant-arrival-rate',
      exec: 'buy',
      rate: 5,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    login_duration: ['p(95)<200'],
    checkout_success: ['rate>0.99'],
    'group_duration{group:::Buy flow}': ['p(95)<800'],
  },
};

export function browse() {
  group('Browse', () => {
    const page = 1 + Math.floor(Math.random() * 5);
    check(http.get(`${BASE}/api/products?page=${page}`), { 'list ok': (r) => r.status === 200 });
    sleep(2);
    const id = 1 + Math.floor(Math.random() * 50);
    check(http.get(`${BASE}/api/products/${id}`), { 'detail ok': (r) => r.status === 200 });
    sleep(3);
  });
}

export function buy() {
  const user = users[Math.floor(Math.random() * users.length)];

  group('Buy flow', () => {
    const login = http.post(`${BASE}/api/login`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    loginTime.add(login.timings.duration);
    const loggedIn = check(login, { 'login 200': (r) => r.status === 200 });
    if (!loggedIn) {
      checkoutSuccess.add(false);
      return;
    }

    const token = login.json('token');
    const cart = http.post(`${BASE}/api/cart`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const added = check(cart, { 'cart 201': (r) => r.status === 201 });
    if (added) cartAdds.add(1);
    checkoutSuccess.add(added);
  });
}
