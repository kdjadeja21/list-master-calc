import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Lazy: `getAuth`/`getFirestore` validate the config (e.g. API key format)
// as soon as they're called, so we defer calling them until something
// actually needs Firebase.
let authInstance: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(firebaseApp);
  return authInstance;
}

let dbInstance: Firestore | null = null;
export function getFirebaseDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(firebaseApp);
  return dbInstance;
}

let analyticsInstance: Analytics | null = null;
let analyticsInit: Promise<Analytics | null> | null = null;

/** Browser-only; resolves to null on the server or when Analytics is unsupported. */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
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
