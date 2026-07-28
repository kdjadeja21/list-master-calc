"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthBootShell } from "@/components/auth/auth-boot-shell";
import { useFirebaseSync } from "@/components/providers/firebase-sync";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, uid } = useFirebaseSync();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (!uid && !isPublicPath(pathname)) {
      router.replace("/sign-in");
      return;
    }

    if (uid && pathname.startsWith("/sign-in")) {
      router.replace("/");
    }
  }, [ready, uid, pathname, router]);

  if (!ready) {
    return <AuthBootShell />;
  }

  // Avoid flashing protected UI before the redirect runs.
  if (!uid && !isPublicPath(pathname)) {
    return <AuthBootShell />;
  }

  // Avoid flashing sign-in while redirecting an authenticated user home.
  if (uid && pathname.startsWith("/sign-in")) {
    return <AuthBootShell />;
  }

  return children;
}
