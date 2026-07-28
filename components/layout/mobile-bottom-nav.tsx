"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileBottomNavItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
  /** Visually present but non-interactive (e.g. current screen). */
  disabled?: boolean;
};

export type MobileBottomNavFab = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type MobileBottomNavProps = {
  left: MobileBottomNavItem;
  center: MobileBottomNavFab;
  right: MobileBottomNavItem;
  className?: string;
};

function NavItem({ item }: { item: MobileBottomNavItem }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.onClick}
      disabled={item.disabled || !item.onClick}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-colors",
        item.active
          ? "text-primary"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        (item.disabled || !item.onClick) && "cursor-default opacity-100"
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl transition-colors",
          item.active && "bg-primary/12"
        )}
      >
        <Icon className="size-5" strokeWidth={item.active ? 2.25 : 2} />
      </span>
      <span className="text-[10px] font-medium leading-none">{item.label}</span>
    </button>
  );
}

export function MobileBottomNav({ left, center, right, className }: MobileBottomNavProps) {
  const FabIcon = center.icon;

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 sm:hidden",
        className
      )}
    >
      <div className="pointer-events-none mx-auto max-w-2xl px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto relative rounded-2xl border border-border/70 bg-card/95 shadow-[0_-8px_32px_oklch(0.27_0.03_40/0.08)] backdrop-blur-md">
          <div className="grid grid-cols-3 items-end px-2 pt-2 pb-1">
            <NavItem item={left} />

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={center.onClick}
                disabled={center.disabled}
                aria-label={center.label}
                className="-mt-7 flex size-[3.75rem] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_oklch(0.5_0.15_40/0.35)] ring-4 ring-card transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                <FabIcon className="size-7" strokeWidth={2.25} />
              </button>
              <span className="mt-1.5 text-[10px] font-semibold text-primary">{center.label}</span>
            </div>

            <NavItem item={right} />
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Reserve space above the fixed bottom nav on mobile pages. */
export const MOBILE_BOTTOM_NAV_PADDING = "pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:pb-0";
