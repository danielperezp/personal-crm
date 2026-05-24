import api from '../../lib/api.ts';
import type { UserListDTO, UserDetailDTO } from './types.ts';
import type { PaginatedResult } from '@nexus/shared';

export const userApi = {
  list: (params?: { role?: string; status?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResult<UserListDTO>>('/users', { params }).then(r => r.data),

  detail: (userId: string) =>
    api.get<UserDetailDTO>(`/users/${userId}`).then(r => r.data),

  me: () => api.get<UserDetailDTO>('/users/me').then(r => r.data),

  register: (payload: { firebaseUid: string; email: string; displayName: string; role?: string }) =>
    api.post('/users/commands/RegisterUser', payload).then(r => r.data),

  changeRole: (userId: string, newRole: string) =>
    api.post('/users/commands/ChangeUserRole', { userId, newRole }).then(r => r.data),

  suspend: (userId: string, reason?: string) =>
    api.post('/users/commands/SuspendUser', { userId, reason }).then(r => r.data),

  reactivate: (userId: string) =>
    api.post('/users/commands/ReactivateUser', { userId }).then(r => r.data),

  deactivate: (userId: string, reason?: string) =>
    api.post('/users/commands/DeactivateUser', { userId, reason }).then(r => r.data),

  updatePreferences: (userId: string, changes: Record<string, unknown>) =>
    api.post('/users/commands/UpdateUserPreferences', { userId, changes }).then(r => r.data),
};
