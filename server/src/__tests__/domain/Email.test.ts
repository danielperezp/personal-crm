import { describe, it, expect } from 'vitest';
import { Email, InvalidEmailError } from '../../domain/shared/types/email.js';

describe('Email', () => {
  it('normalizes to lowercase', () => {
    expect(Email.create('User@Example.COM').value).toBe('user@example.com');
  });

  it('trims whitespace', () => {
    expect(Email.create('  test@test.com  ').value).toBe('test@test.com');
  });

  it('rejects invalid email', () => {
    expect(() => Email.create('notanemail')).toThrow(InvalidEmailError);
    expect(() => Email.create('@no-local.com')).toThrow(InvalidEmailError);
  });
});
