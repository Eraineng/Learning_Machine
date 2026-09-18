import { describe, it, expect } from 'vitest';
import { anonymizeUser, maskEmail, maskCard, findPii } from '../src/anonymize';
import { buildUser, resetIds, seedFaker } from '../src/factories';

describe('anonymizing production data for test environments', () => {
  const realUser = {
    ...buildUser(),
    email: 'john.smith@realcompany.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+441234567890',
  };

  it('removes all real personal data', () => {
    const safe = anonymizeUser(realUser);

    expect(safe.email).not.toContain('john.smith');
    expect(safe.email).toMatch(/^user_[a-f0-9]{10}@anonymized\.test$/);
    expect(safe.firstName).not.toBe('John');
    expect(safe.phone).toBe('+10000000000');
  });

  it('keeps non-personal fields intact (so the data is still useful)', () => {
    const safe = anonymizeUser(realUser);
    expect(safe.id).toBe(realUser.id);
    expect(safe.plan).toBe(realUser.plan);
    expect(safe.createdAt).toBe(realUser.createdAt);
  });

  it('is deterministic → referential integrity is preserved', () => {
    // The same email in two tables maps to the same pseudonym, so joins still work
    expect(anonymizeUser(realUser).email).toBe(anonymizeUser({ ...realUser, id: 999 }).email);
  });

  it('different people get different pseudonyms', () => {
    const other = { ...realUser, email: 'jane.doe@realcompany.com' };
    expect(anonymizeUser(other).email).not.toBe(anonymizeUser(realUser).email);
  });
});

describe('masking (for logs, reports and screenshots)', () => {
  it.each([
    ['john.smith@example.com', 'j********h@example.com'], // 10-char local part → first + 8 stars + last
    ['ab@x.com', 'a*b@x.com'],
  ])('maskEmail(%s)', (input, expected) => {
    expect(maskEmail(input)).toBe(expected);
  });

  it('masks a card number but keeps the last 4', () => {
    expect(maskCard('4111111111111111')).toBe('************1111');
  });
});

describe('PII detection: never commit real data into test fixtures', () => {
  it('flags real-looking personal data', () => {
    const badFixture = `{
      "email": "real.person@gmail.com",
      "card": "4111 1111 1111 1111",
      "ssn": "123-45-6789",
      "phone": "+441234567890"
    }`;
    const found = findPii(badFixture);

    expect(found).toHaveLength(4);
    expect(found.join()).toMatch(/email|creditCard|ssn|phone/);
  });

  it('accepts safe synthetic data', () => {
    resetIds();
    seedFaker();
    const safeFixture = JSON.stringify(anonymizeUser(buildUser()));
    expect(findPii(safeFixture)).toEqual([]);
  });
});
