// NEGATIVE NON-FUNCTIONAL #3 — RESILIENCE: slow gateways, timeouts, dropped connections, load
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createFlightApi } from '../src/flightApi.js';

const book = (app, user, body = { seats: 1 }) =>
  request(app).post('/bookings').set('Authorization', `Bearer ${user}`).send(body);

describe('slow payment gateway', () => {
  it('🔓 VULNERABLE: the request hangs as long as the gateway does (no timeout)', async () => {
    const app = createFlightApi({ mode: 'vulnerable', gateway: { latencyMs: 600, failRate: 0 } });

    const start = Date.now();
    const res = await book(app, 'user-a');
    const elapsed = Date.now() - start;

    expect(res.status).toBe(201);
    expect(elapsed).toBeGreaterThan(500); // the user stares at a spinner
    // At scale, every hanging request holds a connection → thread/connection pool exhaustion
    // → the WHOLE site goes down because ONE downstream service is slow.
  });

  it('🔒 SAFE: a payment failure leaves no partial booking', async () => {
    const app = createFlightApi({ mode: 'safe', gateway: { latencyMs: 10, failRate: 1 } });

    const res = await book(app, 'user-a', { seats: 2 });

    expect(res.status).toBe(502);
    const state = (await request(app).get('/_debug/state')).body;
    expect(state.bookings).toHaveLength(0);
    expect(state.seatsBooked).toBe(0); // no seat leak, no orphan booking
  });
});

describe('client disconnects mid-request (network drop / user closes the tab)', () => {
  it('the booking outcome must be knowable afterwards', async () => {
    const app = createFlightApi({ mode: 'safe', gateway: { latencyMs: 50 } });

    // The client aborts after 10ms — the server keeps processing
    const req = book(app, 'user-a', { seats: 1, idempotencyKey: 'retry-after-drop' });
    setTimeout(() => req.abort(), 10);
    await req.catch(() => {}); // the client never sees the response

    await new Promise((r) => setTimeout(r, 120)); // let the server finish

    // ⭐ The retry with the SAME idempotency key must return the original booking,
    //    not create a second one. This is how a mobile app recovers from a dropped connection.
    const retry = await book(app, 'user-a', { seats: 1, idempotencyKey: 'retry-after-drop' });

    expect([200, 201]).toContain(retry.status);
    const state = (await request(app).get('/_debug/state')).body;
    expect(state.seatsBooked).toBe(1); // exactly one seat taken despite the drop + retry
    expect(state.bookings).toHaveLength(1);
  });
});

describe('sustained load (a mini performance check inside a functional suite)', () => {
  it('🔒 SAFE: 200 concurrent attempts on a 50-seat flight stay consistent and fast', async () => {
    const app = createFlightApi({ mode: 'safe', capacity: 50, gateway: { latencyMs: 2 } });

    const start = Date.now();
    const responses = await Promise.all(
      Array.from({ length: 200 }, (_, i) => book(app, `user-${i}`)),
    );
    const elapsed = Date.now() - start;

    const confirmed = responses.filter((r) => r.status === 201).length;
    const soldOut = responses.filter((r) => r.status === 409).length;
    const errors = responses.filter((r) => r.status >= 500).length;
    const state = (await request(app).get('/_debug/state')).body;

    console.log(`200 requests in ${elapsed}ms → ${confirmed} confirmed, ${soldOut} sold out, ${errors} errors`);

    expect(confirmed).toBe(50);
    expect(soldOut).toBe(150);
    expect(errors).toBe(0); // ⭐ "sold out" is a correct answer; a 500 is not
    expect(state.seatsBooked).toBe(50);
  });

  it('🔓 VULNERABLE: the same load oversells badly', async () => {
    const app = createFlightApi({ mode: 'vulnerable', capacity: 50, gateway: { latencyMs: 2 } });

    const responses = await Promise.all(
      Array.from({ length: 200 }, (_, i) => book(app, `user-${i}`)),
    );
    const confirmed = responses.filter((r) => r.status === 201).length;

    console.log(`VULNERABLE under load → ${confirmed} confirmed on a 50-seat flight`);
    expect(confirmed).toBeGreaterThan(50);
  });
});

describe('data consistency invariants (what you assert after ANY chaos)', () => {
  it('seats booked always equals the sum of confirmed bookings', async () => {
    const app = createFlightApi({ mode: 'safe', capacity: 10 });

    // A messy mix: bookings, cancellations, oversized requests, invalid input
    await Promise.all([
      book(app, 'a', { seats: 2 }),
      book(app, 'b', { seats: 3 }),
      book(app, 'c', { seats: 0 }),
      book(app, 'd', { seats: 99 }),
      book(app, 'e', { seats: 4 }),
    ]);
    const state1 = (await request(app).get('/_debug/state')).body;
    const toCancel = state1.bookings[0];
    await request(app).post(`/bookings/${toCancel.id}/cancel`).set('Authorization', `Bearer ${toCancel.userId}`);

    const state = (await request(app).get('/_debug/state')).body;
    const confirmedSeats = state.bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.seats, 0);

    expect(state.seatsBooked).toBe(confirmedSeats); // the counter never drifts
    expect(state.seatsBooked).toBeGreaterThanOrEqual(0);
    expect(state.seatsBooked).toBeLessThanOrEqual(state.seatsTotal);
  });
});
