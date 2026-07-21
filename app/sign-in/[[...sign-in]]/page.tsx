"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/firebase/client";
import { signInAsLocalTestUser } from "@/lib/local/local-auth";

// Temporary: lets anyone try the whole app (create lists, sections, items…)
// without a real Google account. This test session is fully local (stored
// in `localStorage`) and never touches Firebase — no project, credentials,
// or network access required. Gate it behind an env flag so it never ships
// to a production build by accident. Remove once real testing is done.
const TEST_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === "true";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err) {
      console.error("Sign in failed", err);
      toast.error("Could not sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleTestSignIn() {
    setTestLoading(true);
    try {
      signInAsLocalTestUser();
      router.push("/");
    } catch (err) {
      console.error("Test sign in failed", err);
      toast.error("Could not start a test session. Please try again.");
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex w-full flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground">
          Sign in to sync your lists across devices.
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-xl border-border bg-card text-sm font-medium"
          onClick={handleGoogleSignIn}
          disabled={loading || testLoading}
        >
          <GoogleIcon />
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>

        {TEST_LOGIN_ENABLED ? (
          <>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>for testing only</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="h-11 w-full rounded-xl text-sm font-medium"
              onClick={handleTestSignIn}
              disabled={loading || testLoading}
            >
              {testLoading ? "Starting test session..." : "Continue with test account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Temporary login for QA — skips Google sign-in so you can try every feature. Data
              created here is not tied to a real account and may be wiped at any time.
            </p>
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
