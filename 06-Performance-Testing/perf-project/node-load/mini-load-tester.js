// A tiny load tester written from scratch, to understand what tools like k6 do internally.
// Each virtual user (VU) loops through a user journey until the test ends.
// Start the server first: npm run server
const BASE = process.env.TARGET ?? 'http://localhost:3333';
const VUS = Number(process.env.VUS ?? 20);
const DURATION_S = Number(process.env.DURATION ?? 10);

const samples = []; // { name, ms, ok }

async function timed(name, fn) {
  const start = performance.now();
  let ok = false;
  try {
    const res = await fn();
    ok = res.ok;
    await res.arrayBuffer(); // read the body — part of response time
  } catch {
    ok = false;
  }
  samples.push({ name, ms: performance.now() - start, ok });
}

async function userJourney() {
  let token;
  await timed('POST /api/login', async () => {
    const res = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'vu', password: 'secret' }),
    });
    token = (await res.clone().json()).token;
    return res;
  });
  await timed('GET /api/products', () => fetch(`${BASE}/api/products?page=1`));
  await timed('GET /api/products/:id', () => fetch(`${BASE}/api/products/${1 + Math.floor(Math.random() * 50)}`));
  await timed('POST /api/cart', () =>
    fetch(`${BASE}/api/cart`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  );
  await new Promise((r) => setTimeout(r, 200)); // think time: real users pause between actions
}

function percentile(sorted, p) {
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

async function vu(endAt) {
  while (Date.now() < endAt) await userJourney();
}

const endAt = Date.now() + DURATION_S * 1000;
console.log(`Running ${VUS} virtual users for ${DURATION_S}s against ${BASE} ...`);
await Promise.all(Array.from({ length: VUS }, () => vu(endAt)));

const byName = Object.groupBy(samples, (s) => s.name);
const rows = Object.entries(byName).map(([name, list]) => {
  const times = list.map((s) => s.ms).sort((a, b) => a - b);
  const errors = list.filter((s) => !s.ok).length;
  return {
    request: name,
    count: list.length,
    'avg ms': Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    'p50 ms': Math.round(percentile(times, 50)),
    'p95 ms': Math.round(percentile(times, 95)),
    'max ms': Math.round(times.at(-1)),
    'error %': ((errors / list.length) * 100).toFixed(1),
  };
});
console.table(rows);

const throughput = (samples.length / DURATION_S).toFixed(1);
const allTimes = samples.map((s) => s.ms).sort((a, b) => a - b);
const p95 = percentile(allTimes, 95);
console.log(`Total requests: ${samples.length}  |  Throughput: ${throughput} req/s  |  Overall p95: ${Math.round(p95)} ms`);

// Thresholds
const failed = p95 > 300 || samples.some((s) => !s.ok);
console.log(failed ? '❌ Thresholds FAILED (p95 > 300ms or errors)' : '✅ Thresholds passed');
process.exitCode = failed ? 1 : 0;
