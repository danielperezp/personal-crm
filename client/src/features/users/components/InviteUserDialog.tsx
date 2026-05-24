interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ open, onClose }: InviteUserDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Invite User</h2>
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <strong>V1 Note:</strong> User must sign in with Firebase Auth first before they can be added to NexusCommand.
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              disabled
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2" disabled>
              <option value="Viewer">Viewer — Read-only access</option>
              <option value="Admin">Admin — Manage all modules</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Cancel
          </button>
          {/* V2: will dispatch InviteUser command */}
          <button
            disabled
            title="User must sign in with Firebase Auth first"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white opacity-50 cursor-not-allowed"
          >
            Send Invite (V2)
          </button>
        </div>
      </div>
    </div>
  );
}
