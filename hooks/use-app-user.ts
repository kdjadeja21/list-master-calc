"use client";

import { signOut } from "firebase/auth";
import { useFirebaseSync } from "@/components/providers/firebase-sync";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function useAppUser() {
  const { email, displayName, photoURL, uid } = useFirebaseSync();

  return {
    email: email ?? undefined,
    displayName: displayName ?? undefined,
    photoURL: photoURL ?? undefined,
    uid,
    signOut: async (options?: { redirectUrl?: string }) => {
      await signOut(getFirebaseAuth());
      if (options?.redirectUrl && typeof window !== "undefined") {
        window.location.href = options.redirectUrl;
      }
    },
  };
}
