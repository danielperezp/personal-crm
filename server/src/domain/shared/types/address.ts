import { ValueObject } from '../ValueObject.js';
import { DomainError } from '../DomainError.js';

export class InvalidAddressError extends DomainError {
  constructor(message: string) { super(message); }
}

interface AddressProps {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export class Address extends ValueObject<AddressProps> {
  get street(): string { return this.props.street; }
  get city(): string { return this.props.city; }
  get state(): string | undefined { return this.props.state; }
  get postalCode(): string { return this.props.postalCode; }
  get country(): string { return this.props.country; }

  static create(props: AddressProps): Address {
    if (!props.street || !props.city || !props.postalCode || !props.country) {
      throw new InvalidAddressError('street, city, postalCode, country are required');
    }
    return new Address(props);
  }
}
