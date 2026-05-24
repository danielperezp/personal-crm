import { useQuery } from '@tanstack/react-query';
import { userApi } from './userApi.ts';
import { UserTable } from './components/UserTable.tsx';
import { InviteUserDialog } from './components/InviteUserDialog.tsx';
import { useState } from 'react';

export function UserManagementPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.list(),
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load users</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setInviteOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Invite User
        </button>
      </div>
      <UserTable users={data?.data ?? []} />
      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
