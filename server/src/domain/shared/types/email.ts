import { ValueObject } from '../ValueObject.js';
import { DomainError } from '../DomainError.js';

export class InvalidEmailError extends DomainError {
  constructor(value: string) { super(`Invalid email: ${value}`); }
}

export class Email extends ValueObject<{ value: string }> {
  get value(): string { return this.props.value; }

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    return new Email({ value: normalized });
  }
}
