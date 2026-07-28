import { BrandHeader } from "@/components/brand/logo";

/** Short branded shell while auth resolves or a redirect is in flight. */
export function AuthBootShell() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-linear-to-b from-accent/40 via-background to-background px-4 py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <BrandHeader tagline="Loading your workspace…" />
        <div
          className="size-8 animate-pulse rounded-full bg-primary/25"
          aria-hidden="true"
        />
        <span className="sr-only">Loading</span>
      </div>
    </main>
  );
}
