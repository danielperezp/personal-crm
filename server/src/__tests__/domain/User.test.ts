import { describe, it, expect } from 'vitest';
import { User } from '../../domain/user/User.js';
import { LastOwnerError } from '../../domain/user/User.errors.js';
import type { UserId } from '../../domain/shared/types/branded.js';

const userId = 'usr_test001' as UserId;
const baseProps = {
  userId,
  firebaseUid: 'firebase_uid_1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'Owner' as const,
};

describe('User aggregate', () => {
  it('registers a new user and emits UserRegistered event', () => {
    const user = User.register(baseProps);
    const events = user.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('UserRegistered');
    expect(user.version).toBe(1);
    expect(user.email.value).toBe('test@example.com');
    expect(user.role).toBe('Owner');
    expect(user.status).toBe('Active');
  });

  it('reconstitutes from events', () => {
    const original = User.register(baseProps);
    const events = [...original.getUncommittedEvents()];
    const reconstituted = User.reconstitute(events as import('../../domain/shared/DomainEvent.js').DomainEvent[]);
    expect(reconstituted.email.value).toBe('test@example.com');
    expect(reconstituted.role).toBe('Owner');
  });

  it('suspends a non-owner user', () => {
    const user = User.register({ ...baseProps, role: 'Admin' });
    user.clearUncommittedEvents();
    user.suspend('test reason', userId, false);
    expect(user.status).toBe('Suspended');
    expect(user.getUncommittedEvents()[0].eventType).toBe('UserSuspended');
  });

  it('throws LastOwnerError when trying to suspend last owner', () => {
    const user = User.register(baseProps);
    expect(() => user.suspend(undefined, userId, true)).toThrow(LastOwnerError);
  });

  it('reactivates a suspended user', () => {
    const user = User.register({ ...baseProps, role: 'Admin' });
    user.suspend(undefined, userId, false);
    user.reactivate(userId);
    expect(user.status).toBe('Active');
  });

  it('throws LastOwnerError when demoting last owner', () => {
    const user = User.register(baseProps);
    expect(() => user.changeRole('Admin', userId, true)).toThrow(LastOwnerError);
  });

  it('records login', () => {
    const user = User.register(baseProps);
    const loginAt = Date.now();
    user.recordLogin(loginAt);
    expect(user.lastLoginAt).toBe(loginAt);
    expect(user.getUncommittedEvents().some(e => e.eventType === 'UserLoggedIn')).toBe(true);
  });

  it('Owner has all permissions', () => {
    const user = User.register(baseProps);
    expect(user.permissions).toContain('users:manage');
    expect(user.permissions).toContain('events:replay');
  });

  it('Viewer only has read permissions', () => {
    const user = User.register({ ...baseProps, role: 'Viewer' });
    for (const p of user.permissions) {
      expect(p.endsWith(':read')).toBe(true);
    }
  });
});
