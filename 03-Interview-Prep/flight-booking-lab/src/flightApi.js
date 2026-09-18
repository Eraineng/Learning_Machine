// FLIGHT BOOKING API — two modes, so every negative scenario can be proven and then fixed.
//   mode 'vulnerable' : the naive implementation most systems start with
//   mode 'safe'       : the hardened version
// ⚠️ Training code. Runs locally only.
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createFlightApi({
  mode = 'vulnerable',
  capacity = 5,
  gateway = { latencyMs: 20, failRate: 0 }, // simulated payment provider
  dbWriteDelayMs = 5, // widens the read→write window so the race is observable
} = {}) {
  const safe = mode === 'safe';
  const db = new DatabaseSync(':memory:');

  db.exec(`
    CREATE TABLE flights (id TEXT PRIMARY KEY, seats_total INTEGER, seats_booked INTEGER, price REAL);
    CREATE TABLE bookings (
      id TEXT PRIMARY KEY, flight_id TEXT, user_id TEXT, seats INTEGER,
      total REAL, status TEXT, idempotency_key TEXT, created_at TEXT
    );
  `);
  db.prepare('INSERT INTO flights VALUES (?,?,?,?)').run('FL100', capacity, 0, 199.0);

  const app = express();
  app.use(express.json());

  // Minimal auth: "Bearer user-a" → user id "user-a"
  const currentUser = (req) => (req.headers.authorization ?? '').replace('Bearer ', '') || null;
  const requireAuth = (req, res, next) => {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'authentication required' });
    res.locals.user = user;
    next();
  };

  // ── Simulated external payment gateway ─────────────────────────────────────
  async function chargeCard(amount) {
    await sleep(gateway.latencyMs);
    if (Math.random() < gateway.failRate) throw new Error('gateway error');
    return { transactionId: randomUUID(), amount };
  }

  app.get('/flights/:id', (req, res) => {
    const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(req.params.id);
    if (!flight) return res.status(404).json({ error: 'flight not found' });
    res.json({
      id: flight.id,
      price: flight.price,
      seatsAvailable: flight.seats_total - flight.seats_booked,
      seatsBooked: flight.seats_booked,
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // POST /bookings — overselling, price tampering, input validation, idempotency
  // ════════════════════════════════════════════════════════════════════════════
  app.post('/bookings', requireAuth, async (req, res) => {
    const { flightId = 'FL100', seats = 1, price, idempotencyKey } = req.body ?? {};
    const user = res.locals.user;

    if (safe) {
      // ✅ Input validation (negative testing: 0, -1, 999, "two", 1.5, null)
      if (!Number.isInteger(seats) || seats < 1 || seats > 9) {
        return res.status(400).json({ error: 'seats must be an integer between 1 and 9' });
      }
      // ✅ Idempotency: a retried/double-clicked request returns the SAME booking
      if (idempotencyKey) {
        const existing = db.prepare('SELECT * FROM bookings WHERE idempotency_key = ?').get(idempotencyKey);
        if (existing) return res.status(200).json({ ...toBooking(existing), replayed: true });
      }
    }

    const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(flightId);
    if (!flight) return res.status(404).json({ error: 'flight not found' });

    // ── Seat reservation ──────────────────────────────────────────────────────
    if (safe) {
      // ✅ ATOMIC conditional update: the database decides, not the application.
      // If another request took the seats first, `changes` is 0 → sold out.
      const result = db
        .prepare('UPDATE flights SET seats_booked = seats_booked + ? WHERE id = ? AND seats_booked + ? <= seats_total')
        .run(seats, flightId, seats);
      if (result.changes === 0) {
        return res.status(409).json({ error: 'not enough seats available' });
      }
    } else {
      // ❌ READ → think → WRITE. Two requests can both pass this check. Classic race condition.
      const available = flight.seats_total - flight.seats_booked;
      if (available < seats) return res.status(409).json({ error: 'not enough seats available' });
      await sleep(dbWriteDelayMs); // the window where another request slips in
      db.prepare('UPDATE flights SET seats_booked = seats_booked + ? WHERE id = ?').run(seats, flightId);
    }

    // ── Price ────────────────────────────────────────────────────────────────
    // ❌ vulnerable: trusts a price sent by the client (price tampering / BFLA)
    // ✅ safe: price always comes from the server's own data
    const unitPrice = safe ? flight.price : price ?? flight.price;
    const total = Number((unitPrice * seats).toFixed(2));

    // ── Payment ──────────────────────────────────────────────────────────────
    try {
      await chargeCard(total);
    } catch (err) {
      if (safe) {
        // ✅ Compensate: give the seats back, or they are lost forever
        db.prepare('UPDATE flights SET seats_booked = seats_booked - ? WHERE id = ?').run(seats, flightId);
        return res.status(502).json({ error: 'payment failed, booking not created' });
      }
      // ❌ vulnerable: seats stay reserved for a booking that never existed (seat leak)
      return res.status(500).json({ error: String(err) });
    }

    const booking = {
      id: randomUUID(),
      flight_id: flightId,
      user_id: user,
      seats,
      total,
      status: 'confirmed',
      idempotency_key: idempotencyKey ?? null,
      created_at: new Date().toISOString(),
    };
    db.prepare('INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?)').run(
      booking.id, booking.flight_id, booking.user_id, booking.seats,
      booking.total, booking.status, booking.idempotency_key, booking.created_at,
    );
    res.status(201).json(toBooking(booking));
  });

  // ════════════════════════════════════════════════════════════════════════════
  // GET /bookings/:id — BOLA / IDOR (OWASP API #1)
  // ════════════════════════════════════════════════════════════════════════════
  app.get('/bookings/:id', requireAuth, (req, res) => {
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'booking not found' });

    // ✅ safe: you may only read your own booking (404, not 403, to avoid id enumeration)
    if (safe && row.user_id !== res.locals.user) {
      return res.status(404).json({ error: 'booking not found' });
    }
    res.json(toBooking(row)); // ❌ vulnerable: ANY logged-in user reads ANY booking
  });

  // ════════════════════════════════════════════════════════════════════════════
  // POST /bookings/:id/cancel — state machine + refunds
  // ════════════════════════════════════════════════════════════════════════════
  app.post('/bookings/:id/cancel', requireAuth, (req, res) => {
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'booking not found' });
    if (safe && row.user_id !== res.locals.user) return res.status(404).json({ error: 'booking not found' });

    // ✅ safe: cancelling twice must not release the seats twice (invalid state transition)
    if (safe && row.status === 'cancelled') {
      return res.status(409).json({ error: 'booking already cancelled' });
    }

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', row.id);
    db.prepare('UPDATE flights SET seats_booked = seats_booked - ? WHERE id = ?').run(row.seats, row.flight_id);
    res.json({ ...toBooking(row), status: 'cancelled' });
  });

  app.get('/_debug/state', (_req, res) => {
    const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get('FL100');
    const bookings = db.prepare('SELECT * FROM bookings').all();
    res.json({
      seatsTotal: flight.seats_total,
      seatsBooked: flight.seats_booked,
      confirmedSeats: bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.seats, 0),
      bookings: bookings.map(toBooking),
    });
  });

  return app;
}

const toBooking = (row) => ({
  id: row.id, flightId: row.flight_id, userId: row.user_id,
  seats: row.seats, total: row.total, status: row.status, createdAt: row.created_at,
});
