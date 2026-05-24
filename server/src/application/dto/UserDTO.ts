import type { UserRole, UserStatus, Permission } from '@nexus/shared';

export interface UserListDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: number;
  createdAt: number;
}

export interface UserDetailDTO extends UserListDTO {
  permissions: Permission[];
  firebaseUid: string;
  preferences: {
    theme: 'light' | 'dark';
    currency: string;
    dateFormat: string;
    timezone: string;
  };
  updatedAt: number;
}
