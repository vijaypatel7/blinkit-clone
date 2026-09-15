/**
 * Performance test harness.
 *
 * A lightweight load generator that hammers a running API and reports latency
 * percentiles. This is intentionally dependency-free so it can run anywhere;
 * for serious load testing, swap in autocannon/k6 (documented below).
 *
 * Usage:
 *   1. Start the API (npm run dev).
 *   2. Run:  node tests/performance/index.js
 *
 * For k6 (recommended for 10k concurrent users):
 *   k6 run tests/performance/load.k6.js
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api/v1';
const CONCURRENCY = Number(process.env.CONCURRENCY || 50);
const ITERATIONS = Number(process.env.ITERATIONS || 500);
const ENDPOINTS = ['/home', '/products?limit=20', '/categories/tree'];

async function main() {
  console.log(`Load test: ${CONCURRENCY} concurrent, ${ITERATIONS} iterations against ${BASE_URL}`);

  for (const endpoint of ENDPOINTS) {
    const latencies = await runEndpoint(endpoint);
    report(endpoint, latencies);
  }
}

async function runEndpoint(endpoint) {
  const latencies = [];
  const queue = Array.from({ length: ITERATIONS }, (_, i) => i);

  async function worker() {
    while (queue.length) {
      queue.pop(); // claim a slot
      const started = performance.now();
      try {
        await fetch(`${BASE_URL}${endpoint}`);
      } catch {
        /* network error counts as a sample too */
      }
      latencies.push(performance.now() - started);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return latencies;
}

function report(endpoint, latencies) {
  latencies.sort((a, b) => a - b);
  const pct = (p) => latencies[Math.floor((p / 100) * latencies.length)];
  console.log(`\n${endpoint}`);
  console.log(`  samples : ${latencies.length}`);
  console.log(`  p50     : ${pct(50).toFixed(1)} ms`);
  console.log(`  p90     : ${pct(90).toFixed(1)} ms`);
  console.log(`  p99     : ${pct(99).toFixed(1)} ms`);
  console.log(`  max     : ${latencies[latencies.length - 1].toFixed(1)} ms`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
