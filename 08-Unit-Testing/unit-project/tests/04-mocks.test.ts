// Lesson 3 — test doubles: mocks, stubs, spies, fake timers
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderService, type PaymentGateway, type EmailSender } from '../src/orderService';
import { scheduleReminder } from '../src/userService';

describe('OrderService (with mocked dependencies)', () => {
  let payment: PaymentGateway;
  let email: EmailSender;
  let service: OrderService;
  const fixedNow = () => new Date('2026-09-17T10:00:00Z'); // stub: controlled time

  const order = { id: 'A-1', email: 'ann@test.com', amount: 50, cardToken: 'tok_123' };

  beforeEach(() => {
    // vi.fn() creates a mock function that records every call
    payment = { charge: vi.fn() };
    email = { send: vi.fn().mockResolvedValue(undefined) };
    service = new OrderService(payment, email, fixedNow);
  });

  it('charges the card and sends a confirmation email', async () => {
    vi.mocked(payment.charge).mockResolvedValue({ success: true, transactionId: 'tx_9' }); // stub the result

    const result = await service.placeOrder(order);

    expect(result).toEqual({ status: 'paid', paidAt: '2026-09-17T10:00:00.000Z' });

    // Verify interactions (this is what makes it a "mock")
    expect(payment.charge).toHaveBeenCalledOnce();
    expect(payment.charge).toHaveBeenCalledWith(50, 'tok_123');
    expect(email.send).toHaveBeenCalledWith(
      'ann@test.com',
      'Order confirmed',
      expect.stringContaining('tx_9'),
    );
  });

  it('sends a failure email when payment is declined', async () => {
    vi.mocked(payment.charge).mockResolvedValue({ success: false });

    const result = await service.placeOrder(order);

    expect(result.status).toBe('failed');
    expect(email.send).toHaveBeenCalledWith('ann@test.com', 'Payment failed', expect.any(String));
  });

  it('never charges when amount is invalid', async () => {
    await expect(service.placeOrder({ ...order, amount: 0 })).rejects.toThrow('Amount must be positive');
    expect(payment.charge).not.toHaveBeenCalled();
    expect(email.send).not.toHaveBeenCalled();
  });

  it('propagates payment gateway errors', async () => {
    vi.mocked(payment.charge).mockRejectedValue(new Error('Gateway timeout'));

    await expect(service.placeOrder(order)).rejects.toThrow('Gateway timeout');
    expect(email.send).not.toHaveBeenCalled();
  });
});

describe('spies', () => {
  afterEach(() => {
    vi.restoreAllMocks(); // put real implementations back
  });

  it('spyOn watches a real method', () => {
    const logger = { log: (msg: string) => `logged: ${msg}` };
    const spy = vi.spyOn(logger, 'log');

    const out = logger.log('hi');

    expect(out).toBe('logged: hi'); // real code still ran
    expect(spy).toHaveBeenCalledWith('hi');
  });

  it('spyOn can also replace behavior', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
    expect(Math.random()).toBe(0.42);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('fake timers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires the reminder after 5 minutes without actually waiting', () => {
    const callback = vi.fn();
    scheduleReminder(callback, 5);

    vi.advanceTimersByTime(4 * 60_000);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60_000);
    expect(callback).toHaveBeenCalledWith('Reminder after 5 min');
  });

  it('controls the current date', () => {
    vi.setSystemTime(new Date('2030-01-01'));
    expect(new Date().getFullYear()).toBe(2030);
  });
});
