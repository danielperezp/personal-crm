import { ValueObject } from '../ValueObject.js';
import { DomainError } from '../DomainError.js';

export class InvalidPhoneError extends DomainError {
  constructor(value: string) { super(`Invalid phone number: ${value}`); }
}

export class Phone extends ValueObject<{ digits: string; original: string }> {
  get value(): string { return this.props.digits; }
  get display(): string { return this.props.original; }

  static create(value: string): Phone {
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      throw new InvalidPhoneError(value);
    }
    return new Phone({ digits, original: trimmed });
  }
}
