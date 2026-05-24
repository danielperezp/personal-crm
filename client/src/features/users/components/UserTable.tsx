import type { UserListDTO } from '../types.ts';
import { UserAvatar } from './UserAvatar.tsx';

interface UserTableProps {
  users: UserListDTO[];
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Suspended: 'bg-yellow-100 text-yellow-700',
  Deactivated: 'bg-red-100 text-red-700',
};

const roleColors: Record<string, string> = {
  Owner: 'bg-purple-100 text-purple-700',
  Admin: 'bg-blue-100 text-blue-700',
  Viewer: 'bg-gray-100 text-gray-700',
};

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} />
                  <div>
                    <div className="font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${roleColors[user.role] ?? ''}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[user.status] ?? ''}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className="text-gray-400">—</span>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
