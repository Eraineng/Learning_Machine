// Lesson 1 — the simplest unit tests
import { describe, it, test, expect } from 'vitest';
import { add, divide, isEven, roundMoney } from '../src/math';

describe('add', () => {
  it('adds two positive numbers', () => {
    // Arrange
    const a = 2;
    const b = 3;
    // Act
    const result = add(a, b);
    // Assert
    expect(result).toBe(5);
  });

  it('adds negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it('adding zero returns the same number', () => {
    expect(add(7, 0)).toBe(7);
  });
});

describe('divide', () => {
  test('divides normally', () => {
    expect(divide(10, 4)).toBe(2.5);
  });

  test('throws when dividing by zero', () => {
    // Wrap in a function so the error is caught by expect
    expect(() => divide(1, 0)).toThrow('Cannot divide by zero');
  });
});

describe('isEven', () => {
  test.each([
    [0, true],
    [1, false],
    [2, true],
    [-4, true],
    [-3, false],
  ])('isEven(%i) → %s', (input, expected) => {
    expect(isEven(input)).toBe(expected);
  });
});

describe('roundMoney', () => {
  test('floating point trap: 0.1 + 0.2', () => {
    expect(0.1 + 0.2).not.toBe(0.3); // 0.30000000000000004 !
    expect(0.1 + 0.2).toBeCloseTo(0.3); // compare decimals safely
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});
