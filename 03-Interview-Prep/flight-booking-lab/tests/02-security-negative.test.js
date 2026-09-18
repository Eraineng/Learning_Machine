// NEGATIVE NON-FUNCTIONAL #2 — SECURITY (OWASP API Top 10 on a booking flow)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createFlightApi } from '../src/flightApi.js';

const book = (app, user, body = { seats: 1 }) =>
  request(app).post('/bookings').set('Authorization', `Bearer ${user}`).send(body);

describe('API1:2023 — BOLA / IDOR (Broken Object Level Authorization)', () => {
  it('🔓 VULNERABLE: any logged-in user can read ANOTHER passenger\'s booking', async () => {
    const app = createFlightApi({ mode: 'vulnerable' });
    const { body: aliceBooking } = await book(app, 'alice');

    const res = await request(app)
      .get(`/bookings/${aliceBooking.id}`)
      .set('Authorization', 'Bearer mallory'); // a different, ordinary user

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('alice'); // 🚨 passenger data disclosure (GDPR breach)
  });

  it('🔒 SAFE: another user gets 404, the owner gets 200', async () => {
    const app = createFlightApi({ mode: 'safe' });
    const { body: aliceBooking } = await book(app, 'alice');

    await request(app).get(`/bookings/${aliceBooking.id}`).set('Authorization', 'Bearer mallory').expect(404);
    await request(app).get(`/bookings/${aliceBooking.id}`).set('Authorization', 'Bearer alice').expect(200);
    // 404 (not 403) so an attacker cannot confirm which booking ids exist.
  });

  it('🔓 VULNERABLE: another user can CANCEL your flight (BFLA)', async () => {
    const app = createFlightApi({ mode: 'vulnerable' });
    const { body: aliceBooking } = await book(app, 'alice');

    const res = await request(app)
      .post(`/bookings/${aliceBooking.id}/cancel`)
      .set('Authorization', 'Bearer mallory');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled'); // 🚨 denial of service against a real passenger
  });

  it('🔒 SAFE: only the owner can cancel', async () => {
    const app = createFlightApi({ mode: 'safe' });
    const { body: aliceBooking } = await book(app, 'alice');

    await request(app).post(`/bookings/${aliceBooking.id}/cancel`).set('Authorization', 'Bearer mallory').expect(404);
    await request(app).post(`/bookings/${aliceBooking.id}/cancel`).set('Authorization', 'Bearer alice').expect(200);
  });

  it('both modes require authentication at all', async () => {
    for (const mode of ['vulnerable', 'safe']) {
      const app = createFlightApi({ mode });
      await request(app).post('/bookings').send({ seats: 1 }).expect(401);
      await request(app).get('/bookings/any-id').expect(401);
    }
  });
});

describe('Price tampering (mass assignment / trusting client input)', () => {
  it('🔓 VULNERABLE: the client sets its own ticket price', async () => {
    const app = createFlightApi({ mode: 'vulnerable' });

    const res = await book(app, 'mallory', { seats: 2, price: 0.01 });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(0.02); // 🚨 €398 ticket sold for 2 cents
  });

  it('🔒 SAFE: the server always prices the ticket itself', async () => {
    const app = createFlightApi({ mode: 'safe' });

    const res = await book(app, 'mallory', { seats: 2, price: 0.01 });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(398.0); // 2 × 199.00, client input ignored
  });

  it('🔓 VULNERABLE: a NEGATIVE price creates a refund to the attacker', async () => {
    const app = createFlightApi({ mode: 'vulnerable' });
    const res = await book(app, 'mallory', { seats: 1, price: -500 });

    expect(res.body.total).toBe(-500); // 🚨 the airline pays the passenger
  });
});

describe('Input validation (negative testing of the booking payload)', () => {
  const badPayloads = [
    { seats: 0, why: 'zero seats' },
    { seats: -3, why: 'negative seats' },
    { seats: 9999, why: 'absurd quantity (resource exhaustion)' },
    { seats: 1.5, why: 'fractional seats' },
    { seats: 'two', why: 'wrong type' },
    { seats: null, why: 'null' },
  ];

  it.each(badPayloads)('🔒 SAFE rejects $why with 400', async ({ seats }) => {
    const app = createFlightApi({ mode: 'safe' });
    const res = await book(app, 'user-a', { seats });

    expect(res.status).toBe(400);
    expect((await request(app).get('/_debug/state')).body.seatsBooked).toBe(0); // nothing reserved
  });

  it('🔓 VULNERABLE accepts nonsense and corrupts the seat counter', async () => {
    const app = createFlightApi({ mode: 'vulnerable', capacity: 5 });

    await book(app, 'mallory', { seats: -3 }); // "books" negative seats
    const state = (await request(app).get('/_debug/state')).body;

    expect(state.seatsBooked).toBe(-3); // 🚨 flight now sells 8 seats on a 5-seat aircraft
  });

  it('🔒 SAFE: error messages do not leak internals', async () => {
    const app = createFlightApi({ mode: 'safe' });
    const res = await book(app, 'user-a', { seats: 'two' });

    const text = JSON.stringify(res.body).toLowerCase();
    ['sqlite', 'select ', 'stack', 'at /', 'node_modules'].forEach((leak) => {
      expect(text, `must not leak "${leak}"`).not.toContain(leak);
    });
  });
});
