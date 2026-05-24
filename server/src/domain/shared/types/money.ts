import { ValueObject } from '../ValueObject.js';
import { DomainError } from '../DomainError.js';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'MXN' | 'BRL' | 'COP';

export class InvalidMoneyError extends DomainError {
  constructor(message: string) { super(message); }
}

export class CurrencyMismatchError extends DomainError {
  constructor(a: CurrencyCode, b: CurrencyCode) {
    super(`Currency mismatch: ${a} vs ${b}`);
  }
}

export class Money extends ValueObject<{ amount: number; currency: CurrencyCode }> {
  get amount(): number { return this.props.amount; }
  get currency(): CurrencyCode { return this.props.currency; }

  static create(amount: number, currency: CurrencyCode): Money {
    if (amount < 0) throw new InvalidMoneyError('Amount cannot be negative');
    return new Money({ amount: Math.round(amount * 100) / 100, currency });
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    if (this.amount - other.amount < 0) throw new InvalidMoneyError('Subtraction result cannot be negative');
    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(Math.round(this.amount * factor * 100) / 100, this.currency);
  }

  isZero(): boolean { return this.amount === 0; }
  isPositive(): boolean { return this.amount > 0; }

  ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}
