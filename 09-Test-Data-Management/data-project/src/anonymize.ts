// Anonymizing production data for use in test environments (GDPR and friends).
import { createHash } from 'node:crypto';
import type { User } from './types';

/** Deterministic pseudonym: the same input always maps to the same fake value,
 *  so relationships between tables stay consistent (referential integrity). */
const pseudo = (value: string, salt = 'test-salt') =>
  createHash('sha256').update(salt + value).digest('hex').slice(0, 10);

export function anonymizeUser(user: User): User {
  return {
    ...user,
    email: `user_${pseudo(user.email)}@anonymized.test`,
    firstName: `First_${pseudo(user.firstName).slice(0, 5)}`,
    lastName: `Last_${pseudo(user.lastName).slice(0, 5)}`,
    phone: '+10000000000',
  };
}

/** Masking keeps a recognizable shape but hides the value (useful in logs/reports). */
export const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  return `${local[0]}${'*'.repeat(Math.max(local.length - 2, 1))}${local.at(-1)}@${domain}`;
};

export const maskCard = (card: string) => card.replace(/\d(?=\d{4})/g, '*');

/** Detect PII that must never appear in test fixtures, logs or bug reports. */
export function findPii(text: string): string[] {
  const patterns: Record<string, RegExp> = {
    email: /[\w.+-]+@(?!anonymized\.test|test\.example)[\w-]+\.[\w.]+/g,
    creditCard: /\b(?:\d[ -]?){13,16}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    phone: /\+\d{10,15}\b/g,
  };
  // Values our own anonymizer produces are safe by definition — don't report them.
  const allowList = ['+10000000000'];

  return Object.entries(patterns).flatMap(([name, re]) =>
    (text.match(re) ?? []).filter((m) => !allowList.includes(m.trim())).map((m) => `${name}: ${m}`),
  );
}
