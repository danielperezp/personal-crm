import type { DomainEvent } from '../../domain/shared/DomainEvent.js';
import type { IProjection } from './ProjectionEngine.js';
import type { IReadModelRepository } from '../../application/ports/IReadModelRepository.js';
import type { UserRole, UserStatus } from '@nexus/shared';

interface UserRegisteredPayload {
  userId: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
}

export class UserListProjection implements IProjection {
  readonly name = 'UserListProjection';
  readonly subscribedEvents = [
    'UserRegistered',
    'UserUpdated',
    'UserRoleChanged',
    'UserPermissionsUpdated',
    'UserSuspended',
    'UserReactivated',
    'UserDeactivated',
    'UserLoggedIn',
  ];

  constructor(private readonly readModelRepo: IReadModelRepository) {}

  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'UserRegistered': {
        const p = event.payload as UserRegisteredPayload;
        await this.readModelRepo.upsert('rm_users', p.userId, {
          id: p.userId,
          firebaseUid: p.firebaseUid,
          email: p.email,
          displayName: p.displayName,
          avatarUrl: null,
          role: p.role,
          status: 'Active' as UserStatus,
          permissions: p.permissions,
          lastLoginAt: null,
          createdAt: event.metadata.timestamp,
          updatedAt: event.metadata.timestamp,
        });
        // Secondary index for auth middleware lookup
        await this.readModelRepo.upsert('rm_users_by_firebase_uid', p.firebaseUid, {
          userId: p.userId,
        });
        break;
      }
      case 'UserUpdated': {
        const p = event.payload as { changes: { displayName?: string; avatarUrl?: string } };
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          ...p.changes,
          updatedAt: event.metadata.timestamp,
        });
        break;
      }
      case 'UserRoleChanged': {
        const p = event.payload as { to: UserRole; newPermissions: string[] };
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          role: p.to,
          permissions: p.newPermissions,
          updatedAt: event.metadata.timestamp,
        });
        break;
      }
      case 'UserPermissionsUpdated': {
        const p = event.payload as { permissions: string[] };
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          permissions: p.permissions,
          updatedAt: event.metadata.timestamp,
        });
        break;
      }
      case 'UserSuspended': {
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          status: 'Suspended' as UserStatus,
          updatedAt: event.metadata.timestamp,
        });
        break;
      }
      case 'UserReactivated': {
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          status: 'Active' as UserStatus,
          updatedAt: event.metadata.timestamp,
        });
        break;
      }
      case 'UserDeactivated': {
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          status: 'Deactivated' as UserStatus,
          updatedAt: event.metadata.timestamp,
        });
        break;
      }
      case 'UserLoggedIn': {
        const p = event.payload as { loginAt: number };
        await this.readModelRepo.update('rm_users', event.aggregateId, {
          lastLoginAt: p.loginAt,
        });
        break;
      }
    }
  }
}
