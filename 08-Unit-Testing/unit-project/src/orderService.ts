// A class with DEPENDENCIES — perfect for learning mocks.
// Dependencies are passed in ("dependency injection") so tests can replace them.

export interface PaymentGateway {
  charge(amount: number, cardToken: string): Promise<{ success: boolean; transactionId?: string }>;
}

export interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface Order {
  id: string;
  email: string;
  amount: number;
  cardToken: string;
}

export class OrderService {
  constructor(
    private payment: PaymentGateway,
    private email: EmailSender,
    private now: () => Date = () => new Date(),
  ) {}

  async placeOrder(order: Order): Promise<{ status: 'paid' | 'failed'; paidAt?: string }> {
    if (order.amount <= 0) throw new Error('Amount must be positive');

    const result = await this.payment.charge(order.amount, order.cardToken);

    if (!result.success) {
      await this.email.send(order.email, 'Payment failed', `Order ${order.id} could not be paid.`);
      return { status: 'failed' };
    }

    await this.email.send(
      order.email,
      'Order confirmed',
      `Order ${order.id} paid. Transaction ${result.transactionId}.`,
    );
    return { status: 'paid', paidAt: this.now().toISOString() };
  }
}
