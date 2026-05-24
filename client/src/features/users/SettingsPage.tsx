import { useQuery } from '@tanstack/react-query';
import { userApi } from './userApi.ts';
import { PreferencesForm } from './components/PreferencesForm.tsx';

export function SettingsPage() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => userApi.me(),
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
        {currentUser && <PreferencesForm user={currentUser} />}
      </div>
    </div>
  );
}
