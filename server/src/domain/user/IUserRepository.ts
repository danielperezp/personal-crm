import type { User } from './User.js';
import type { UserRole } from '@nexus/shared';

export interface IUserRepository {
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;
  countByRole(role: UserRole): Promise<number>;
  getUserCount(): Promise<number>;
}
