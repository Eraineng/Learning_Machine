// Lesson 2 — structure, hooks and matchers
import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from '../src/cart';

const mug = { sku: 'MUG', name: 'Blue Mug', price: 12.5, quantity: 1 };
const shirt = { sku: 'SHIRT', name: 'T-Shirt', price: 20, quantity: 2 };

describe('Cart', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart(); // fresh cart for EVERY test → tests are independent
  });

  describe('adding items', () => {
    it('starts empty', () => {
      expect(cart.getItems()).toEqual([]);
      expect(cart.itemCount).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('adds an item', () => {
      cart.addItem(mug);

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0]).toEqual(mug); // deep equality
      expect(cart.getItems()[0]).not.toBe(mug); // but a copy, not the same object
    });

    it('merges quantity when the same sku is added twice', () => {
      cart.addItem(mug);
      cart.addItem({ ...mug, quantity: 3 });

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.itemCount).toBe(4);
    });

    it('rejects zero quantity', () => {
      expect(() => cart.addItem({ ...mug, quantity: 0 })).toThrow('Quantity must be positive');
    });

    it('rejects negative price', () => {
      expect(() => cart.addItem({ ...mug, price: -1 })).toThrow(/negative/);
    });
  });

  describe('totals', () => {
    beforeEach(() => {
      cart.addItem(mug); // 12.50
      cart.addItem(shirt); // 2 × 20 = 40
    });

    it('calculates subtotal', () => {
      expect(cart.subtotal).toBe(52.5);
    });

    it.each([
      ['SAVE10', 47.25],
      ['save10', 47.25], // case-insensitive
      ['HALF', 26.25],
    ])('coupon %s → total %d', (code, expected) => {
      cart.applyCoupon(code);
      expect(cart.total).toBe(expected);
    });

    it('rejects an unknown coupon and keeps the total', () => {
      expect(() => cart.applyCoupon('FREE')).toThrow('Invalid coupon: FREE');
      expect(cart.total).toBe(52.5);
    });

    it('removing an item updates the total', () => {
      cart.removeItem('SHIRT');
      expect(cart.total).toBe(12.5);
      expect(cart.getItems()).not.toContainEqual(expect.objectContaining({ sku: 'SHIRT' }));
    });
  });
});

describe('matcher showcase', () => {
  it('common matchers', () => {
    expect(1 + 1).toBe(2); // strict ===
    expect({ a: 1 }).toEqual({ a: 1 }); // deep equality
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 }); // partial
    expect([1, 2, 3]).toContain(2);
    expect('hello world').toMatch(/world/);
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect('text').toBeTruthy();
    expect(0).toBeFalsy();
    expect(10).toBeGreaterThan(5);
    expect(['a', 'b']).toHaveLength(2);
    expect({ user: { name: 'Ann' } }).toHaveProperty('user.name', 'Ann');
    expect({ id: 7, createdAt: '2026-01-01' }).toEqual({ id: expect.any(Number), createdAt: expect.any(String) });
  });
});
