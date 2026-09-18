// Lesson 2 — applying test design (EP + BVA from folder 00) to unit tests
import { describe, it, expect } from 'vitest';
import { validatePassword } from '../src/password';

describe('validatePassword', () => {
  it('accepts a valid password', () => {
    expect(validatePassword('Secret123')).toEqual({ valid: true, errors: [] });
  });

  describe('length boundaries (8–20)', () => {
    it.each([
      { length: 7, valid: false },
      { length: 8, valid: true },
      { length: 20, valid: true },
      { length: 21, valid: false },
    ])('length $length → valid: $valid', ({ length, valid }) => {
      const password = 'A1' + 'x'.repeat(length - 2);
      expect(password).toHaveLength(length);
      expect(validatePassword(password).valid).toBe(valid);
    });
  });

  describe('individual rules', () => {
    it.each([
      ['Secretabc', 'Needs a digit'],
      ['secret123', 'Needs an uppercase letter'],
      ['Secret 123', 'No spaces allowed'],
      ['Ab1', 'Too short'],
    ])('"%s" → "%s"', (password, expectedError) => {
      const result = validatePassword(password);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expectedError);
    });
  });

  it('reports ALL problems at once', () => {
    expect(validatePassword('abc').errors).toEqual([
      'Too short',
      'Needs a digit',
      'Needs an uppercase letter',
    ]);
  });

  it('empty string', () => {
    expect(validatePassword('').valid).toBe(false);
  });
});
