import { AggregateRoot } from '../shared/AggregateRoot.js';
import { Email } from '../shared/types/email.js';
import { UserPreferences } from './vo/UserPreferences.js';
import {
  LastOwnerError,
  UserNotActiveError,
  UserAlreadySuspendedError,
  UserNotSuspendedError,
  UserAlreadyDeactivatedError,
} from './User.errors.js';
import { ROLE_PERMISSIONS } from '@nexus/shared';
import type { UserId } from '../shared/types/branded.js';
import type { DomainEvent } from '../shared/DomainEvent.js';
import type { UserRole, UserStatus, Permission } from '@nexus/shared';
import type {
  UserEvent,
  UserRegisteredEvent,
  UserRoleChangedEvent,
  UserSuspendedEvent,
  UserReactivatedEvent,
  UserDeactivatedEvent,
  UserPreferencesUpdatedEvent,
  UserLoggedInEvent,
  UserUpdatedEvent,
  UserPermissionsUpdatedEvent,
} from './User.events.js';
import { randomUUID } from 'crypto';

interface UserState {
  userId: UserId;
  firebaseUid: string;
  email: Email;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  lastLoginAt?: number;
  preferences: UserPreferences;
  createdAt: number;
  updatedAt: number;
}

function makeMetadata(userId: string) {
  return {
    userId,
    correlationId: randomUUID(),
    causationId: randomUUID(),
    timestamp: Date.now(),
  };
}

export class User extends AggregateRoot<UserId> {
  private state!: UserState;

  private constructor(id: UserId) {
    super(id);
  }

  static register(props: {
    userId: UserId;
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
  }): User {
    const user = new User(props.userId);
    const email = Email.create(props.email);
    const permissions = ROLE_PERMISSIONS[props.role] as Permission[];

    const event: UserRegisteredEvent = {
      eventId: randomUUID(),
      aggregateId: props.userId,
      aggregateType: 'User',
      eventType: 'UserRegistered',
      version: 1,
      payload: {
        userId: props.userId,
        firebaseUid: props.firebaseUid,
        email: email.value,
        displayName: props.displayName,
        role: props.role,
        permissions,
      },
      metadata: makeMetadata(props.userId),
    };

    user.apply(event);
    return user;
  }

  static reconstitute(events: DomainEvent[]): User {
    if (events.length === 0) throw new Error('Cannot reconstitute User from empty events');
    const firstEvent = events[0];
    const user = new User(firstEvent.aggregateId as UserId);
    user.rehydrate(events);
    return user;
  }

  update(changes: { displayName?: string; avatarUrl?: string }, actorId: string): void {
    if (this.state.status !== 'Active') throw new UserNotActiveError();
    const event: UserUpdatedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserUpdated',
      version: this.version + 1,
      payload: { changes },
      metadata: makeMetadata(actorId),
    };
    this.apply(event);
  }

  changeRole(newRole: UserRole, changedBy: string, isLastOwner: boolean): void {
    if (this.state.role === 'Owner' && newRole !== 'Owner' && isLastOwner) {
      throw new LastOwnerError();
    }
    const newPermissions = ROLE_PERMISSIONS[newRole] as Permission[];
    const event: UserRoleChangedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserRoleChanged',
      version: this.version + 1,
      payload: { from: this.state.role, to: newRole, changedBy, newPermissions },
      metadata: makeMetadata(changedBy),
    };
    this.apply(event);
  }

  updatePermissions(permissions: Permission[], actorId: string): void {
    const event: UserPermissionsUpdatedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserPermissionsUpdated',
      version: this.version + 1,
      payload: { permissions },
      metadata: makeMetadata(actorId),
    };
    this.apply(event);
  }

  suspend(reason: string | undefined, suspendedBy: string, isLastOwner: boolean): void {
    if (this.state.status !== 'Active') throw new UserNotActiveError();
    if (this.state.role === 'Owner' && isLastOwner) throw new LastOwnerError();
    const event: UserSuspendedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserSuspended',
      version: this.version + 1,
      payload: { reason, suspendedBy },
      metadata: makeMetadata(suspendedBy),
    };
    this.apply(event);
  }

  reactivate(reactivatedBy: string): void {
    if (this.state.status !== 'Suspended') throw new UserNotSuspendedError();
    const event: UserReactivatedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserReactivated',
      version: this.version + 1,
      payload: { reactivatedBy },
      metadata: makeMetadata(reactivatedBy),
    };
    this.apply(event);
  }

  deactivate(reason: string | undefined, deactivatedBy: string, isLastOwner: boolean): void {
    if (this.state.status !== 'Active' && this.state.status !== 'Suspended') throw new UserAlreadyDeactivatedError();
    if (this.state.role === 'Owner' && isLastOwner) throw new LastOwnerError();
    const event: UserDeactivatedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserDeactivated',
      version: this.version + 1,
      payload: { reason, deactivatedBy },
      metadata: makeMetadata(deactivatedBy),
    };
    this.apply(event);
  }

  updatePreferences(changes: Parameters<UserPreferences['merge']>[0], actorId: string): void {
    const event: UserPreferencesUpdatedEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserPreferencesUpdated',
      version: this.version + 1,
      payload: { changes },
      metadata: makeMetadata(actorId),
    };
    this.apply(event);
  }

  recordLogin(loginAt: number): void {
    const event: UserLoggedInEvent = {
      eventId: randomUUID(),
      aggregateId: this._id,
      aggregateType: 'User',
      eventType: 'UserLoggedIn',
      version: this.version + 1,
      payload: { loginAt },
      metadata: makeMetadata(this._id),
    };
    this.apply(event);
  }

  protected when(event: DomainEvent): void {
    const e = event as UserEvent;

    switch (e.eventType) {
      case 'UserRegistered': {
        this.state = {
          userId: e.payload.userId as UserId,
          firebaseUid: e.payload.firebaseUid,
          email: Email.create(e.payload.email),
          displayName: e.payload.displayName,
          role: e.payload.role,
          permissions: e.payload.permissions as Permission[],
          status: 'Active',
          preferences: UserPreferences.create(),
          createdAt: e.metadata.timestamp,
          updatedAt: e.metadata.timestamp,
        };
        break;
      }
      case 'UserUpdated': {
        if (e.payload.changes.displayName) this.state.displayName = e.payload.changes.displayName;
        if (e.payload.changes.avatarUrl !== undefined) this.state.avatarUrl = e.payload.changes.avatarUrl;
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserRoleChanged': {
        this.state.role = e.payload.to;
        this.state.permissions = e.payload.newPermissions as Permission[];
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserPermissionsUpdated': {
        this.state.permissions = e.payload.permissions as Permission[];
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserSuspended': {
        this.state.status = 'Suspended';
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserReactivated': {
        this.state.status = 'Active';
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserDeactivated': {
        this.state.status = 'Deactivated';
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserPreferencesUpdated': {
        this.state.preferences = this.state.preferences.merge(e.payload.changes as Parameters<UserPreferences['merge']>[0]);
        this.state.updatedAt = e.metadata.timestamp;
        break;
      }
      case 'UserLoggedIn': {
        this.state.lastLoginAt = e.payload.loginAt;
        break;
      }
    }
  }

  get userId(): UserId { return this.state.userId; }
  get firebaseUid(): string { return this.state.firebaseUid; }
  get email(): Email { return this.state.email; }
  get displayName(): string { return this.state.displayName; }
  get avatarUrl(): string | undefined { return this.state.avatarUrl; }
  get role(): UserRole { return this.state.role; }
  get permissions(): Permission[] { return this.state.permissions; }
  get status(): UserStatus { return this.state.status; }
  get lastLoginAt(): number | undefined { return this.state.lastLoginAt; }
  get preferences(): UserPreferences { return this.state.preferences; }
  get createdAt(): number { return this.state.createdAt; }
  get updatedAt(): number { return this.state.updatedAt; }
}
