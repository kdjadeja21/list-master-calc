"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAnalytics, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  getLocalTestUser,
  subscribeLocalTestUser,
  type LocalUser,
} from "@/lib/local/local-auth";

export interface FirebaseSyncState {
  ready: boolean;
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  /** True for the local, Firebase-free test account. */
  isLocal: boolean;
}

const INITIAL_STATE: FirebaseSyncState = {
  ready: false,
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  isAnonymous: false,
  isLocal: false,
};

const SIGNED_OUT_STATE: FirebaseSyncState = { ...INITIAL_STATE, ready: true };

const FirebaseSyncContext = createContext<FirebaseSyncState>(INITIAL_STATE);

export function useFirebaseSync() {
  return useContext(FirebaseSyncContext);
}

function firebaseUserToState(user: User | null): FirebaseSyncState {
  return {
    ready: true,
    uid: user?.uid ?? null,
    email: user?.email ?? null,
    displayName: user?.displayName ?? null,
    photoURL: user?.photoURL ?? null,
    isAnonymous: user?.isAnonymous ?? false,
    isLocal: false,
  };
}

function localUserToState(user: LocalUser): FirebaseSyncState {
  return {
    ready: true,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: true,
    isLocal: true,
  };
}

export function FirebaseSync({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FirebaseSyncState>(INITIAL_STATE);

  useEffect(() => {
    // The local test account runs entirely on `localStorage`, so we never
    // call into the Firebase Auth SDK (or Analytics) while it's active —
    // no project, credentials, emulator, or network access required.
    let unsubscribeFirebase: (() => void) | null = null;

    function startFirebaseListener() {
      if (unsubscribeFirebase) return;

      // Without real credentials (or the emulator), Firebase Auth throws
      // (`auth/invalid-api-key`, etc.) as soon as it's touched. Skip it
      // entirely in that case so the app — and the local test account in
      // particular — never depends on Firebase being configured at all.
      if (!isFirebaseConfigured()) {
        setState((prev) => (prev.ready ? prev : SIGNED_OUT_STATE));
        return;
      }

      try {
        void getFirebaseAnalytics();
        unsubscribeFirebase = onAuthStateChanged(
          getFirebaseAuth(),
          (user) => setState(firebaseUserToState(user)),
          (error) => {
            console.error("Firebase Auth state listener failed", error);
            setState(SIGNED_OUT_STATE);
          }
        );
      } catch (error) {
        console.error("Firebase Auth is unavailable", error);
        setState(SIGNED_OUT_STATE);
      }
    }

    function stopFirebaseListener() {
      unsubscribeFirebase?.();
      unsubscribeFirebase = null;
    }

    function syncFromLocalTestSession() {
      const localUser = getLocalTestUser();
      if (localUser) {
        stopFirebaseListener();
        setState(localUserToState(localUser));
        return;
      }

      if (!unsubscribeFirebase) {
        setState((prev) => (prev.isLocal ? SIGNED_OUT_STATE : prev));
        startFirebaseListener();
      }
    }

    syncFromLocalTestSession();
    const unsubscribeLocal = subscribeLocalTestUser(syncFromLocalTestSession);

    return () => {
      unsubscribeLocal();
      stopFirebaseListener();
    };
  }, []);

  return (
    <FirebaseSyncContext.Provider value={state}>
      {children}
    </FirebaseSyncContext.Provider>
  );
}
