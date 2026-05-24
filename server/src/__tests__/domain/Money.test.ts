import { describe, it, expect } from 'vitest';
import { Money, InvalidMoneyError, CurrencyMismatchError } from '../../domain/shared/types/money.js';

describe('Money', () => {
  it('creates valid money', () => {
    const m = Money.create(10.5, 'USD');
    expect(m.amount).toBe(10.5);
    expect(m.currency).toBe('USD');
  });

  it('rounds to 2 decimal places', () => {
    const m = Money.create(10.999, 'USD');
    expect(m.amount).toBe(11);
  });

  it('rejects negative amount', () => {
    expect(() => Money.create(-1, 'USD')).toThrow(InvalidMoneyError);
  });

  it('adds same currency', () => {
    const result = Money.create(10, 'USD').add(Money.create(5, 'USD'));
    expect(result.amount).toBe(15);
  });

  it('throws on currency mismatch', () => {
    expect(() => Money.create(10, 'USD').add(Money.create(5, 'EUR'))).toThrow(CurrencyMismatchError);
  });

  it('multiplies correctly', () => {
    expect(Money.create(10, 'USD').multiply(1.5).amount).toBe(15);
  });

  it('isZero and isPositive', () => {
    expect(Money.create(0, 'USD').isZero()).toBe(true);
    expect(Money.create(1, 'USD').isPositive()).toBe(true);
  });
});
