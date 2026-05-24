import type { EventEnvelope } from '../shared/DomainEvent.js';
import type { UserRole, UserStatus } from '@nexus/shared';

export type UserRegisteredEvent = EventEnvelope<'UserRegistered', {
  userId: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
}>;

export type UserUpdatedEvent = EventEnvelope<'UserUpdated', {
  changes: { displayName?: string; avatarUrl?: string };
}>;

export type UserRoleChangedEvent = EventEnvelope<'UserRoleChanged', {
  from: UserRole;
  to: UserRole;
  changedBy: string;
  newPermissions: string[];
}>;

export type UserPermissionsUpdatedEvent = EventEnvelope<'UserPermissionsUpdated', {
  permissions: string[];
}>;

export type UserSuspendedEvent = EventEnvelope<'UserSuspended', {
  reason?: string;
  suspendedBy: string;
}>;

export type UserReactivatedEvent = EventEnvelope<'UserReactivated', {
  reactivatedBy: string;
}>;

export type UserDeactivatedEvent = EventEnvelope<'UserDeactivated', {
  reason?: string;
  deactivatedBy: string;
}>;

export type UserPreferencesUpdatedEvent = EventEnvelope<'UserPreferencesUpdated', {
  changes: {
    theme?: 'light' | 'dark';
    currency?: string;
    dateFormat?: string;
    timezone?: string;
  };
}>;

export type UserLoggedInEvent = EventEnvelope<'UserLoggedIn', {
  loginAt: number;
  ipAddress?: string;
}>;

export type UserEvent =
  | UserRegisteredEvent
  | UserUpdatedEvent
  | UserRoleChangedEvent
  | UserPermissionsUpdatedEvent
  | UserSuspendedEvent
  | UserReactivatedEvent
  | UserDeactivatedEvent
  | UserPreferencesUpdatedEvent
  | UserLoggedInEvent;
