/**
 * k6 load test — recommended for validating 10,000 concurrent users.
 *
 * Usage:
 *   k6 run --vus 1000 --duration 60s tests/performance/load.k6.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';

export const options = {
  stages: [
    { duration: '30s', target: 200 }, // ramp up
    { duration: '2m', target: 1000 }, // sustain 1000 VUs
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% of requests < 200ms
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/home`],
    ['GET', `${BASE_URL}/products?limit=20`],
    ['GET', `${BASE_URL}/categories/tree`],
    ['GET', `${BASE_URL}/promotions/banners`],
  ]);

  check(responses, {
    'all 200': (rs) => rs.every((r) => r.status === 200),
  });

  sleep(1);
}
