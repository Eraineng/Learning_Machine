import { roundMoney } from './math';

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

const COUPONS: Record<string, number> = {
  SAVE10: 0.1,
  HALF: 0.5,
};

export class Cart {
  private items: CartItem[] = [];
  private discount = 0;

  addItem(item: CartItem): void {
    if (item.quantity <= 0) throw new Error('Quantity must be positive');
    if (item.price < 0) throw new Error('Price cannot be negative');

    const existing = this.items.find((i) => i.sku === item.sku);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  removeItem(sku: string): void {
    this.items = this.items.filter((i) => i.sku !== sku);
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  get itemCount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  applyCoupon(code: string): void {
    const rate = COUPONS[code.toUpperCase()];
    if (rate === undefined) throw new Error(`Invalid coupon: ${code}`);
    this.discount = rate;
  }

  get subtotal(): number {
    return roundMoney(this.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  }

  get total(): number {
    return roundMoney(this.subtotal * (1 - this.discount));
  }
}
