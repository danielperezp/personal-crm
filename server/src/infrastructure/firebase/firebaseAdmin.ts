import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';

let _app: App | null = null;

function getApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin SDK env vars not set: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: `${projectId}.appspot.com`,
  });
  return _app;
}

export function getFirestoreDb(): Firestore {
  getApp();
  return getFirestore();
}

export function getFirebaseAuth(): Auth {
  getApp();
  return getAuth();
}

export function getFirebaseStorage(): Storage {
  getApp();
  return getStorage();
}
