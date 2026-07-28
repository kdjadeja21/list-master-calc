"use client";

import { MoreVertical, LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppUser } from "@/hooks/use-app-user";

export function AppHeader({
  title,
  leading,
}: {
  title: string;
  leading?: React.ReactNode;
}) {
  const { email, isAnonymous, signOut } = useAppUser();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {leading ?? <LogoMark className="size-9 shrink-0" />}
        <div className="min-w-0">
          <h1 className="truncate font-serif text-lg font-semibold leading-tight text-foreground">
            {title}
          </h1>
          {isAnonymous ? (
            <p className="truncate text-xs text-muted-foreground">Test account (temporary)</p>
          ) : email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
              aria-label="Account menu"
            />
          }
        >
          <MoreVertical className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => signOut({ redirectUrl: "/sign-in" })}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
