// A LOCAL app to load test. Never load test sites you don't own or have permission to test!
// Run: npm run server   → http://localhost:3333
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 3333);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const products = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: random(5, 200),
}));

const sessions = new Map();
let activeRequests = 0;
let totalRequests = 0;

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = `${req.method} ${url.pathname}`;

  // Simulate a server that slows down when busy (like a real DB connection pool)
  const loadPenalty = Math.max(0, activeRequests - 50) * 5;

  switch (true) {
    case route === 'GET /api/health':
      return send(res, 200, { status: 'ok', activeRequests, totalRequests });

    case route === 'GET /api/fast':
      return send(res, 200, { message: 'fast' });

    case route === 'GET /api/products': {
      await sleep(random(20, 60) + loadPenalty);
      const page = Number(url.searchParams.get('page') ?? 1);
      return send(res, 200, products.slice((page - 1) * 10, page * 10));
    }

    case /^GET \/api\/products\/\d+$/.test(route): {
      await sleep(random(10, 40) + loadPenalty);
      const product = products.find((p) => p.id === Number(url.pathname.split('/').pop()));
      return product ? send(res, 200, product) : send(res, 404, { error: 'not found' });
    }

    case route === 'GET /api/slow':
      await sleep(random(300, 800) + loadPenalty);
      return send(res, 200, { message: 'slow report generated' });

    case route === 'GET /api/cpu': {
      // CPU-heavy work blocks Node's single thread → hurts ALL other requests
      let x = 0;
      for (let i = 0; i < 5e6; i++) x += Math.sqrt(i);
      return send(res, 200, { result: Math.round(x) });
    }

    case route === 'GET /api/flaky':
      await sleep(random(10, 50));
      return Math.random() < 0.05
        ? send(res, 500, { error: 'random failure' })
        : send(res, 200, { message: 'ok' });

    case route === 'POST /api/login': {
      let body = '';
      for await (const chunk of req) body += chunk;
      await sleep(random(50, 120) + loadPenalty); // password hashing is slow on purpose
      const { username, password } = JSON.parse(body || '{}');
      if (password !== 'secret') return send(res, 401, { error: 'invalid credentials' });
      const token = Math.random().toString(36).slice(2);
      sessions.set(token, username);
      return send(res, 200, { token });
    }

    case route === 'POST /api/cart': {
      const token = (req.headers.authorization ?? '').replace('Bearer ', '');
      if (!sessions.has(token)) return send(res, 401, { error: 'login required' });
      await sleep(random(30, 80) + loadPenalty);
      return send(res, 201, { added: true });
    }

    default:
      return send(res, 404, { error: 'route not found' });
  }
}

http
  .createServer(async (req, res) => {
    activeRequests++;
    totalRequests++;
    try {
      await handle(req, res);
    } catch (err) {
      send(res, 500, { error: String(err) });
    } finally {
      activeRequests--;
    }
  })
  .listen(PORT, () => console.log(`Target app on http://localhost:${PORT}`));
