import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm",
        className
      )}
    >
      <Calculator className="size-1/2" strokeWidth={2} />
    </div>
  );
}

export function BrandHeader({
  tagline = "Lists, sections, instant totals.",
}: {
  tagline?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <LogoMark className="size-16" />
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
        Tally
      </h1>
      {tagline ? <p className="text-sm text-muted-foreground">{tagline}</p> : null}
    </div>
  );
}
