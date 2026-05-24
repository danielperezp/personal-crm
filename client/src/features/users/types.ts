export type UserRole = 'Owner' | 'Admin' | 'Viewer';
export type UserStatus = 'Active' | 'Suspended' | 'Deactivated';

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
  permissions: string[];
  firebaseUid: string;
  preferences: {
    theme: 'light' | 'dark';
    currency: string;
    dateFormat: string;
    timezone: string;
  };
  updatedAt: number;
}
