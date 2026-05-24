import { ValueObject } from '../ValueObject.js';

export class Percentage extends ValueObject<{ value: number }> {
  get value(): number { return this.props.value; }

  static create(value: number): Percentage {
    if (value < 0 || value > 100) throw new Error('Percentage must be between 0 and 100');
    return new Percentage({ value });
  }

  applyTo(amount: number): number {
    return Math.round(amount * (this.value / 100) * 100) / 100;
  }
}
