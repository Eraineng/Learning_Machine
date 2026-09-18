export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  plan: 'free' | 'pro' | 'enterprise';
  active: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  items: { sku: string; name: string; price: number; quantity: number }[];
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  total: number;
}
