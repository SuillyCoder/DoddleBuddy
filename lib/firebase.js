import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    // @ts-ignore - _settingsFrozen is internal but prevents reconnection errors
    if (!auth._settingsFrozen) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    // @ts-ignore
    if (!db._settingsFrozen) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    // @ts-ignore
    if (!storage._settingsFrozen) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    console.log('🔧 Connected to Firebase Emulators');
  } catch (error) {
    // Emulators already connected, ignore
    console.log('⚠️ Emulators connection already initialized');
  }
}

export default app;