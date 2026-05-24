import { describe, it, expect } from 'vitest';
import { emailSchema, phoneSchema, moneySchema, paginationSchema } from '../validation/schemas.js';

describe('emailSchema', () => {
  it('normalizes to lowercase', () => {
    expect(emailSchema.parse('User@Example.COM')).toBe('user@example.com');
  });
  it('rejects invalid email', () => {
    expect(() => emailSchema.parse('notanemail')).toThrow();
  });
});

describe('phoneSchema', () => {
  it('strips non-digits', () => {
    expect(phoneSchema.parse('+1 (555) 123-4567')).toBe('15551234567');
  });
  it('rejects too short', () => {
    expect(() => phoneSchema.parse('12345')).toThrow();
  });
});

describe('moneySchema', () => {
  it('accepts valid money', () => {
    expect(moneySchema.parse({ amount: 10.5, currency: 'USD' })).toEqual({ amount: 10.5, currency: 'USD' });
  });
  it('rejects negative amount', () => {
    expect(() => moneySchema.parse({ amount: -1, currency: 'USD' })).toThrow();
  });
});

describe('paginationSchema', () => {
  it('applies defaults', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
  });
});
