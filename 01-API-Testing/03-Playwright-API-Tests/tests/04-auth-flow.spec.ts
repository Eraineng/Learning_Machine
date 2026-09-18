import { test, expect } from '@playwright/test';

// restful-booker is a practice API with real auth. Its default test credentials are public.
const BASE = 'https://restful-booker.herokuapp.com';

test.describe('Booking flow with auth', () => {
  test('create → read → update (with token) → delete', async ({ request }) => {
    // 1. Log in to get a token
    const authRes = await request.post(`${BASE}/auth`, {
      data: { username: 'admin', password: 'password123' },
    });
    expect(authRes.status()).toBe(200);
    const { token } = await authRes.json();
    expect(token).toBeTruthy();

    // 2. Create a booking (no auth needed)
    const booking = {
      firstname: 'Test',
      lastname: 'Learner',
      totalprice: 150,
      depositpaid: true,
      bookingdates: { checkin: '2026-10-01', checkout: '2026-10-05' },
      additionalneeds: 'Breakfast',
    };
    const createRes = await request.post(`${BASE}/booking`, { data: booking });
    expect(createRes.status()).toBe(200); // this API returns 200, not 201 — always check the docs!
    const { bookingid } = await createRes.json();

    // 3. Read it back — was it really saved?
    const getRes = await request.get(`${BASE}/booking/${bookingid}`);
    expect(await getRes.json()).toEqual(booking);

    // 4. Update needs the token, sent as a cookie
    const updateRes = await request.put(`${BASE}/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` },
      data: { ...booking, totalprice: 200 },
    });
    expect(updateRes.status()).toBe(200);
    expect((await updateRes.json()).totalprice).toBe(200);

    // 5. Delete, then confirm it's gone
    const deleteRes = await request.delete(`${BASE}/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` },
    });
    expect(deleteRes.status()).toBe(201); // quirky, but that's what this API returns
    expect((await request.get(`${BASE}/booking/${bookingid}`)).status()).toBe(404);
  });

  test('negative: update without token is forbidden', async ({ request }) => {
    const response = await request.put(`${BASE}/booking/1`, {
      data: { firstname: 'Hacker' },
    });
    expect(response.status()).toBe(403);
  });
});
