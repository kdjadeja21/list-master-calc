"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueryErrorState({
  message = "Something went wrong while loading.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertCircle className="size-10 text-destructive/70" aria-hidden="true" />
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
