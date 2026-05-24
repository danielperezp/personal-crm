import { useState } from 'react';
import { userApi } from '../userApi.ts';
import type { UserDetailDTO } from '../types.ts';

interface PreferencesFormProps {
  user: UserDetailDTO;
}

export function PreferencesForm({ user }: PreferencesFormProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(user.preferences.theme);
  const [currency, setCurrency] = useState(user.preferences.currency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updatePreferences(user.id, { theme, currency });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Theme</span>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-md px-3 py-1 text-sm capitalize ${
                theme === t ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Default Currency</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN', 'BRL', 'COP'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Preferences'}
      </button>
    </div>
  );
}
