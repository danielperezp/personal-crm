import { describe, it, expect } from 'vitest';
import { Phone, InvalidPhoneError } from '../../domain/shared/types/phone.js';

describe('Phone', () => {
  it('strips non-digits and stores normalized', () => {
    const p = Phone.create('+1 (555) 123-4567');
    expect(p.value).toBe('15551234567');
  });

  it('preserves original for display', () => {
    const p = Phone.create('+1 (555) 123-4567');
    expect(p.display).toBe('+1 (555) 123-4567');
  });

  it('rejects too short (< 7 digits)', () => {
    expect(() => Phone.create('12345')).toThrow(InvalidPhoneError);
  });

  it('rejects too long (> 15 digits)', () => {
    expect(() => Phone.create('1234567890123456')).toThrow(InvalidPhoneError);
  });

  it('accepts 7-digit number', () => {
    expect(Phone.create('1234567').value).toBe('1234567');
  });
});
