// FACTORIES: build test objects with sensible defaults; tests override only what they care about.
import { faker } from '@faker-js/faker';
import type { Order, User } from './types';

let idCounter = 0;
export const nextId = () => ++idCounter;
export const resetIds = () => (idCounter = 0);

/** Same seed → same "random" data every run (repeatability!). */
export function seedFaker(seed = 12345) {
  faker.seed(seed);
}

export function buildUser(overrides: Partial<User> = {}): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: nextId(),
    // Unique email per object → tests can run in parallel without collisions
    email: faker.internet.email({ firstName, lastName, provider: 'test.example' }).toLowerCase(),
    firstName,
    lastName,
    phone: faker.phone.number({ style: 'international' }),
    plan: 'free',
    active: true,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    ...overrides, // ⭐ the test's intent, last
  };
}

export const buildUsers = (count: number, overrides: Partial<User> = {}): User[] =>
  Array.from({ length: count }, () => buildUser(overrides));

/** TRAITS: named variations that express meaning instead of magic values. */
export const traits = {
  proUser: (o: Partial<User> = {}) => buildUser({ plan: 'pro', ...o }),
  inactiveUser: (o: Partial<User> = {}) => buildUser({ active: false, ...o }),
  enterpriseAdmin: (o: Partial<User> = {}) => buildUser({ plan: 'enterprise', ...o }),
  userWithLongName: (o: Partial<User> = {}) => buildUser({ firstName: 'A'.repeat(100), ...o }),
  userWithUnicodeName: (o: Partial<User> = {}) => buildUser({ firstName: '日本語', lastName: 'Ñandú 😀', ...o }),
};

export function buildOrder(overrides: Partial<Order> = {}): Order {
  const items = overrides.items ?? [
    { sku: faker.string.alphanumeric(6).toUpperCase(), name: faker.commerce.productName(), price: 19.99, quantity: 1 },
  ];
  const total = Number(items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));
  return { id: nextId(), userId: nextId(), items, status: 'pending', total, ...overrides };
}

/** BUILDER pattern: readable chains for complex objects. */
export class OrderBuilder {
  private order: Order = buildOrder();

  forUser(userId: number) { this.order.userId = userId; return this; }
  withStatus(status: Order['status']) { this.order.status = status; return this; }
  withItem(name: string, price: number, quantity = 1) {
    this.order.items.push({ sku: faker.string.alphanumeric(6).toUpperCase(), name, price, quantity });
    return this;
  }
  empty() { this.order.items = []; return this; }
  build(): Order {
    this.order.total = Number(this.order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));
    return { ...this.order, items: [...this.order.items] };
  }
}
