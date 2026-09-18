// NEGATIVE NON-FUNCTIONAL #1 — RELIABILITY UNDER CONCURRENCY (overselling)
// "What happens when 20 people book the last 5 seats at the same moment?"
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createFlightApi } from '../src/flightApi.js';

const book = (app, user, body = { seats: 1 }) =>
  request(app).post('/bookings').set('Authorization', `Bearer ${user}`).send(body);

describe('concurrent booking of the last seats', () => {
  it('🔓 VULNERABLE: 20 simultaneous requests OVERSELL a 5-seat flight', async () => {
    const app = createFlightApi({ mode: 'vulnerable', capacity: 5 });

    // Fire them all at once — this is the load pattern a flash sale creates
    const responses = await Promise.all(
      Array.from({ length: 20 }, (_, i) => book(app, `user-${i}`)),
    );

    const confirmed = responses.filter((r) => r.status === 201).length;
    const rejected = responses.filter((r) => r.status === 409).length;
    const state = (await request(app).get('/_debug/state')).body;

    console.log(`VULNERABLE → confirmed: ${confirmed}, rejected: ${rejected}, seats booked: ${state.seatsBooked}/5`);

    expect(confirmed).toBeGreaterThan(5); // 🚨 more tickets sold than seats exist
    expect(state.seatsBooked).toBeGreaterThan(state.seatsTotal);
    // Business impact: denied boarding, compensation (EU261 = up to €600/passenger), reputation damage.
  });

  it('🔒 SAFE: exactly 5 confirmed, the rest get 409', async () => {
    const app = createFlightApi({ mode: 'safe', capacity: 5 });

    const responses = await Promise.all(
      Array.from({ length: 20 }, (_, i) => book(app, `user-${i}`)),
    );

    const confirmed = responses.filter((r) => r.status === 201).length;
    const state = (await request(app).get('/_debug/state')).body;

    expect(confirmed).toBe(5);
    expect(state.seatsBooked).toBe(5);
    expect(state.confirmedSeats).toBe(5); // bookings and seat counter agree
    expect(responses.filter((r) => r.status === 409)).toHaveLength(15);
  });

  it('🔒 SAFE: multi-seat requests never exceed capacity', async () => {
    const app = createFlightApi({ mode: 'safe', capacity: 5 });

    // Three families want 3, 3 and 2 seats simultaneously — only 5 seats exist
    const responses = await Promise.all([
      book(app, 'family-a', { seats: 3 }),
      book(app, 'family-b', { seats: 3 }),
      book(app, 'family-c', { seats: 2 }),
    ]);

    const soldSeats = responses
      .filter((r) => r.status === 201)
      .reduce((sum, r) => sum + r.body.seats, 0);

    expect(soldSeats).toBeLessThanOrEqual(5);
    expect((await request(app).get('/_debug/state')).body.seatsBooked).toBe(soldSeats);
  });

  it('🔓 VULNERABLE: a failed payment LEAKS seats (they are never released)', async () => {
    const app = createFlightApi({ mode: 'vulnerable', capacity: 5, gateway: { latencyMs: 5, failRate: 1 } });

    const res = await book(app, 'user-a', { seats: 2 });
    expect(res.status).toBe(500);

    const state = (await request(app).get('/_debug/state')).body;
    expect(state.seatsBooked).toBe(2); // 🚨 2 seats held for a booking that does not exist
    expect(state.bookings).toHaveLength(0);
    // After a few failures the flight looks full while being empty = lost revenue.
  });

  it('🔒 SAFE: a failed payment releases the seats (compensating transaction)', async () => {
    const app = createFlightApi({ mode: 'safe', capacity: 5, gateway: { latencyMs: 5, failRate: 1 } });

    const res = await book(app, 'user-a', { seats: 2 });
    expect(res.status).toBe(502);

    const state = (await request(app).get('/_debug/state')).body;
    expect(state.seatsBooked).toBe(0);
    expect(state.bookings).toHaveLength(0);
  });

  it('🔓 VULNERABLE: double-click creates TWO bookings; 🔒 SAFE replays the first (idempotency)', async () => {
    const vulnerable = createFlightApi({ mode: 'vulnerable', capacity: 5 });
    const key = 'click-123';

    const [v1, v2] = await Promise.all([
      book(vulnerable, 'user-a', { seats: 1, idempotencyKey: key }),
      book(vulnerable, 'user-a', { seats: 1, idempotencyKey: key }),
    ]);
    expect(v1.body.id).not.toBe(v2.body.id); // 🚨 charged twice, two seats taken
    expect((await request(vulnerable).get('/_debug/state')).body.seatsBooked).toBe(2);

    const safe = createFlightApi({ mode: 'safe', capacity: 5 });
    const s1 = await book(safe, 'user-a', { seats: 1, idempotencyKey: key });
    const s2 = await book(safe, 'user-a', { seats: 1, idempotencyKey: key });

    expect(s2.body.id).toBe(s1.body.id); // same booking returned
    expect(s2.body.replayed).toBe(true);
    expect((await request(safe).get('/_debug/state')).body.seatsBooked).toBe(1);
  });

  it('🔒 SAFE: cancelling twice does not release seats twice', async () => {
    const app = createFlightApi({ mode: 'safe', capacity: 5 });
    const { body: booking } = await book(app, 'user-a', { seats: 2 });

    await request(app).post(`/bookings/${booking.id}/cancel`).set('Authorization', 'Bearer user-a').expect(200);
    await request(app).post(`/bookings/${booking.id}/cancel`).set('Authorization', 'Bearer user-a').expect(409);

    expect((await request(app).get('/_debug/state')).body.seatsBooked).toBe(0); // not -2
  });

  it('🔓 VULNERABLE: cancelling twice corrupts the seat counter', async () => {
    const app = createFlightApi({ mode: 'vulnerable', capacity: 5 });
    const { body: booking } = await book(app, 'user-a', { seats: 2 });

    await request(app).post(`/bookings/${booking.id}/cancel`).set('Authorization', 'Bearer user-a');
    await request(app).post(`/bookings/${booking.id}/cancel`).set('Authorization', 'Bearer user-a');

    const state = (await request(app).get('/_debug/state')).body;
    expect(state.seatsBooked).toBe(-2); // 🚨 negative seats → the flight now sells 7 seats
  });
});
