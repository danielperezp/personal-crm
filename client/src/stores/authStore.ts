import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase.ts';

export type UserRole = 'Owner' | 'Admin' | 'Viewer';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  permissions: string[];
  isLoading: boolean;
  setUser: (user: AuthUser | null, token: string | null) => void;
  setRole: (role: UserRole, permissions: string[]) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  permissions: [],
  isLoading: true,
  setUser: (user, token) => set({ user, token, isLoading: false }),
  setRole: (role, permissions) => set({ role, permissions }),
  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, token: null, role: null, permissions: [] });
  },
}));
