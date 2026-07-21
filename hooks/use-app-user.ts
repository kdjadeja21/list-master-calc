"use client";

import { signOut as firebaseSignOut } from "firebase/auth";
import { useFirebaseSync } from "@/components/providers/firebase-sync";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { signOutLocalTestUser } from "@/lib/local/local-auth";

export function useAppUser() {
  const { email, displayName, photoURL, uid, isAnonymous, isLocal } = useFirebaseSync();

  return {
    email: email ?? undefined,
    displayName: displayName ?? undefined,
    photoURL: photoURL ?? undefined,
    uid,
    isAnonymous,
    isLocal,
    signOut: async (options?: { redirectUrl?: string }) => {
      if (isLocal) {
        // Local test sessions never touch Firebase, so signing out is a
        // synchronous, offline `localStorage` update.
        signOutLocalTestUser();
      } else {
        await firebaseSignOut(getFirebaseAuth());
      }
      if (options?.redirectUrl && typeof window !== "undefined") {
        window.location.href = options.redirectUrl;
      }
    },
  };
}
