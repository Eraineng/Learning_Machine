// ⚠️ TRAINING APP. mode 'vuln' contains INTENTIONAL vulnerabilities. Never deploy it.
// Each vulnerable block has a ✅ secure counterpart right next to it — compare them!
import express, { type Request, type Response, type NextFunction } from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { createDb, hashPassword } from './db';

type Mode = 'vuln' | 'secure';
interface User { id: number; username: string; password: string; password_hash: string; role: string }

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 32);
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

export function createApp(mode: Mode) {
  const db = createDb();
  const sessions = new Map<string, number>(); // token → user id
  const failedLogins = new Map<string, number>();
  const app = express();
  app.use(express.json());

  if (mode === 'secure') {
    // ✅ Security headers (in real apps: the `helmet` package)
    app.disable('x-powered-by');
    app.use((_req, res, next) => {
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'no-referrer',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      });
      next();
    });
  }

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '');
    const userId = sessions.get(token);
    if (!userId) return res.status(401).json({ error: 'login required' });
    res.locals.user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as unknown as User;
    next();
  };

  // ───────────── A03 Injection: SQL injection ─────────────
  app.post('/login', (req, res) => {
    const { username = '', password = '' } = req.body ?? {};

    if (mode === 'vuln') {
      // ❌ User input concatenated into SQL
      const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      try {
        const user = db.prepare(sql).get() as unknown as User | undefined;
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const token = randomBytes(16).toString('hex');
        sessions.set(token, user.id);
        return res.json({ token, username: user.username, role: user.role });
      } catch (err) {
        // ❌ A05 Security misconfiguration: leaks internal error details
        return res.status(500).json({ error: String(err), query: sql });
      }
    }

    // ✅ Rate limiting: A07 Identification & authentication failures (brute force)
    const failures = failedLogins.get(username) ?? 0;
    if (failures >= 5) return res.status(429).json({ error: 'Too many attempts, try later' });

    // ✅ Parameterized query + hashed password + generic error message
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username)) as unknown as User | undefined;
    if (!user || !verifyPassword(String(password), user.password_hash)) {
      failedLogins.set(username, failures + 1);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    failedLogins.delete(username);
    const token = randomBytes(32).toString('hex');
    sessions.set(token, user.id);
    return res.json({ token, username: user.username, role: user.role });
  });

  // ───────────── A03 Injection: Cross-Site Scripting (XSS) ─────────────
  app.get('/search', (req, res) => {
    const q = String(req.query.q ?? '');
    const shown = mode === 'vuln' ? q : escapeHtml(q); // ❌ raw vs ✅ escaped
    res.type('html').send(`<html><body><h1>Results for: ${shown}</h1><p>No products found.</p></body></html>`);
  });

  // ───────────── A01 Broken access control: IDOR ─────────────
  app.get('/orders/:id', requireAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id)) as any;
    if (!order) return res.status(404).json({ error: 'not found' });

    // ✅ Check ownership (404 instead of 403 so attackers can't tell which ids exist)
    if (mode === 'secure' && order.user_id !== res.locals.user.id && res.locals.user.role !== 'admin') {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(order); // ❌ vuln: anyone logged in can read anyone's order
  });

  // ───────────── A01 Broken access control: missing function-level check ─────────────
  app.get('/admin/users', requireAuth, (_req, res) => {
    if (mode === 'secure' && res.locals.user.role !== 'admin') {
      return res.status(403).json({ error: 'admin only' });
    }
    const users = db.prepare('SELECT id, username, role FROM users').all();
    res.json(users);
  });

  // ───────────── Mass assignment + A07 weak passwords ─────────────
  app.post('/register', (req, res) => {
    const { username, password, role } = req.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'username and password required' });
    }

    if (mode === 'secure' && password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }
    // ❌ vuln trusts `role` from the request body → anyone can register as admin
    const finalRole = mode === 'vuln' ? (role ?? 'user') : 'user';

    try {
      const result = db
        .prepare('INSERT INTO users (username, password, password_hash, role) VALUES (?, ?, ?, ?)')
        .run(username, password, hashPassword(password), finalRole);
      res.status(201).json({ id: Number(result.lastInsertRowid), username, role: finalRole });
    } catch {
      res.status(409).json({ error: 'username taken' });
    }
  });

  // ───────────── A02 Cryptographic failures / sensitive data exposure ─────────────
  app.get('/profile', requireAuth, (_req, res) => {
    const user = res.locals.user as User;
    if (mode === 'vuln') return res.json(user); // ❌ includes password + hash
    res.json({ id: user.id, username: user.username, role: user.role }); // ✅ only what's needed
  });

  // ───────────── Open redirect ─────────────
  app.get('/redirect', (req, res) => {
    const url = String(req.query.url ?? '/');
    // ✅ secure: only allow local paths like "/orders", not "//evil.com" or "https://evil.com"
    const safe = url.startsWith('/') && !url.startsWith('//');
    if (mode === 'secure' && !safe) return res.status(400).json({ error: 'invalid redirect' });
    res.redirect(url);
  });

  // ───────────── Error handling ─────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (mode === 'vuln') return res.status(500).send(err.stack); // ❌ stack trace to the user
    res.status(500).json({ error: 'Internal server error' }); // ✅ generic
  });

  return app;
}
