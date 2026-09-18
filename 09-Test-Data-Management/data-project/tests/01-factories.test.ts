import { describe, it, expect, beforeEach } from 'vitest';
import { buildUser, buildUsers, traits, buildOrder, OrderBuilder, seedFaker, resetIds } from '../src/factories';

beforeEach(() => {
  resetIds();
  seedFaker(12345); // deterministic data every run
});

describe('why factories beat hardcoded objects', () => {
  it('a test states only what it cares about', () => {
    // ❌ Without a factory you write 8 irrelevant fields and the reader can't tell what matters
    // ✅ With a factory, the override IS the intent:
    const user = buildUser({ plan: 'pro' });

    expect(user.plan).toBe('pro');
    expect(user.email).toContain('@'); // everything else is valid by default
    expect(user.active).toBe(true);
  });

  it('every object is unique → parallel-safe', () => {
    const emails = buildUsers(50).map((u) => u.email);
    expect(new Set(emails).size).toBe(50);
  });

  it('ids do not collide', () => {
    const [a, b] = [buildUser(), buildUser()];
    expect(a.id).not.toBe(b.id);
  });

  it('seeding makes "random" data repeatable', () => {
    seedFaker(999);
    resetIds();
    const first = buildUser();

    seedFaker(999);
    resetIds();
    const second = buildUser();

    expect(second).toEqual(first); // same seed → identical data
  });

  it('traits express meaning instead of magic values', () => {
    expect(traits.proUser().plan).toBe('pro');
    expect(traits.inactiveUser().active).toBe(false);
    expect(traits.userWithLongName().firstName).toHaveLength(100);
    expect(traits.userWithUnicodeName().lastName).toContain('😀');
  });

  it('bulk data for list/pagination tests', () => {
    const users = buildUsers(25, { plan: 'enterprise' });
    expect(users).toHaveLength(25);
    expect(users.every((u) => u.plan === 'enterprise')).toBe(true);
  });
});

describe('builder pattern for complex objects', () => {
  it('reads like a sentence', () => {
    const order = new OrderBuilder()
      .forUser(42)
      .withItem('Blue Mug', 12.5, 2)
      .withItem('T-Shirt', 20)
      .withStatus('paid')
      .build();

    expect(order.userId).toBe(42);
    expect(order.status).toBe('paid');
    expect(order.total).toBe(64.99); // 19.99 default item + 25 + 20
    expect(order.items).toHaveLength(3);
  });

  it('supports edge cases', () => {
    const empty = new OrderBuilder().empty().build();
    expect(empty.items).toEqual([]);
    expect(empty.total).toBe(0);
  });

  it('factories compute derived values so tests stay honest', () => {
    const order = buildOrder({ items: [{ sku: 'A', name: 'Thing', price: 10, quantity: 3 }] });
    expect(order.total).toBe(30);
  });
});
