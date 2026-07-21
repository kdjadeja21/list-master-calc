import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  type Auth,
  type User,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// When set, the client talks to the local Firebase Emulator Suite
// (`firebase emulators:start`) instead of a real Firebase project. This lets
// contributors run and test the full app (auth + Firestore) with no real
// credentials at all — handy alongside the temporary test login below.
const USE_FIREBASE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(
      USE_FIREBASE_EMULATOR ? { ...firebaseConfig, apiKey: "demo-key", projectId: "demo-project" } : firebaseConfig
    );

// Lazy: `getAuth`/`getFirestore` validate the config (e.g. API key format)
// as soon as they're called, so we defer calling them until something
// actually needs Firebase.
let authInstance: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
    if (USE_FIREBASE_EMULATOR) {
      connectAuthEmulator(authInstance, "http://127.0.0.1:9099", { disableWarnings: true });
    }
  }
  return authInstance;
}

let dbInstance: Firestore | null = null;
export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(firebaseApp);
    if (USE_FIREBASE_EMULATOR) {
      connectFirestoreEmulator(dbInstance, "127.0.0.1", 8080);
    }
  }
  return dbInstance;
}

let analyticsInstance: Analytics | null = null;
let analyticsInit: Promise<Analytics | null> | null = null;

/** Browser-only; resolves to null on the server, under the emulator, or when Analytics is unsupported. */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || USE_FIREBASE_EMULATOR) return Promise.resolve(null);
  if (analyticsInstance) return Promise.resolve(analyticsInstance);
  if (!analyticsInit) {
    analyticsInit = isSupported().then((supported) => {
      if (!supported) return null;
      analyticsInstance = getAnalytics(firebaseApp);
      return analyticsInstance;
    });
  }
  return analyticsInit;
}

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle(): Promise<User> {
  return signInWithPopup(getFirebaseAuth(), googleProvider).then((result) => result.user);
}

/**
 * Temporary test login: signs in an anonymous Firebase user so the whole
 * app can be exercised (creating lists, sections, items, etc.) without a
 * real Google account. Intended for QA/testing only — see
 * `NEXT_PUBLIC_ENABLE_TEST_LOGIN` in `.env.local.example`.
 */
export function signInAsTestUser(): Promise<User> {
  return signInAnonymously(getFirebaseAuth()).then((result) => result.user);
}
