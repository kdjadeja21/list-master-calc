import type { ReactNode } from "react";
import { BrandHeader } from "@/components/brand/logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-linear-to-b from-accent/40 via-background to-background px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <BrandHeader />
        {children}
      </div>
    </main>
  );
}
