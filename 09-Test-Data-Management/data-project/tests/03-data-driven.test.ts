// Data-driven (parameterized) testing: one test body, many data rows from external files.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');

// ── JSON test data ────────────────────────────────────────────────────────────
interface CheckoutCase {
  case: string;
  items: { price: number; quantity: number }[];
  coupon: string | null;
  expectedTotal: number;
}
const checkoutCases: CheckoutCase[] = JSON.parse(readFileSync(path.join(dataDir, 'checkout-cases.json'), 'utf8'));

const COUPONS: Record<string, number> = { SAVE10: 0.1, HALF: 0.5 };
function calculateTotal(items: { price: number; quantity: number }[], coupon: string | null): number {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = coupon ? (COUPONS[coupon] ?? 0) : 0;
  return Number((subtotal * (1 - discount)).toFixed(2));
}

describe('checkout totals (data from checkout-cases.json)', () => {
  it.each(checkoutCases)('$case → $expectedTotal', ({ items, coupon, expectedTotal }) => {
    expect(calculateTotal(items, coupon)).toBe(expectedTotal);
  });

  it('adding a case to the JSON file adds a test — no code change needed', () => {
    expect(checkoutCases.length).toBeGreaterThanOrEqual(6);
  });
});

// ── CSV test data (often maintained by non-developers) ────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const rows = text.trim().split(/\r?\n/).map(splitCsvLine);
  const [header, ...data] = rows;
  return data.map((cells) => Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ''])));
}

/** Handles quoted fields containing commas — a classic CSV trap. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else current += char;
  }
  cells.push(current);
  return cells;
}

const loginCases = parseCsv(readFileSync(path.join(dataDir, 'login-cases.csv'), 'utf8'));

function fakeLogin(username: string, password: string): number {
  if (!username) return 400;
  if (!password) return 400;
  if (username === 'locked_out_user') return 423;
  return username === 'standard_user' && password === 'secret_sauce' ? 200 : 401;
}

describe('login cases (data from login-cases.csv)', () => {
  it('parsed all rows, including quoted commas and unicode', () => {
    expect(loginCases).toHaveLength(7);
    expect(loginCases.find((r) => r.description.includes('commas'))!.username).toBe('user,with,commas');
    expect(loginCases.some((r) => r.username.includes('üñí©ödé'))).toBe(true);
  });

  it.each(loginCases)('$description → $expectedStatus', ({ username, password, expectedStatus }) => {
    expect(fakeLogin(username, password)).toBe(Number(expectedStatus));
  });
});
