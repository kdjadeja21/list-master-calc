"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAnalytics, getFirebaseAuth } from "@/lib/firebase/client";

export interface FirebaseSyncState {
  ready: boolean;
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

const INITIAL_STATE: FirebaseSyncState = {
  ready: false,
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  isAnonymous: false,
};

const FirebaseSyncContext = createContext<FirebaseSyncState>(INITIAL_STATE);

export function useFirebaseSync() {
  return useContext(FirebaseSyncContext);
}

function userToState(user: User | null, ready = true): FirebaseSyncState {
  return {
    ready,
    uid: user?.uid ?? null,
    email: user?.email ?? null,
    displayName: user?.displayName ?? null,
    photoURL: user?.photoURL ?? null,
    isAnonymous: user?.isAnonymous ?? false,
  };
}

export function FirebaseSync({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FirebaseSyncState>(INITIAL_STATE);

  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      setState(userToState(user));
    });
    return unsubscribe;
  }, []);

  return (
    <FirebaseSyncContext.Provider value={state}>
      {children}
    </FirebaseSyncContext.Provider>
  );
}
