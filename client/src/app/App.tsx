import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { auth } from '../lib/firebase.ts';
import { queryClient } from '../lib/queryClient.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { router } from './router.tsx';

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setUser(
          { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName },
          token,
        );
      } else {
        setUser(null, null);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
