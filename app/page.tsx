"use client";

import { useState } from "react";
import { ClipboardList, LayoutList, LogOut, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import {
  MOBILE_BOTTOM_NAV_PADDING,
  MobileBottomNav,
} from "@/components/layout/mobile-bottom-nav";
import { NewListDialog, NewListInlineButton } from "@/components/lists/new-list-dialog";
import { ListCard } from "@/components/lists/list-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppUser } from "@/hooks/use-app-user";
import { useAppearingIds } from "@/hooks/use-appearing-ids";
import { useLists } from "@/hooks/use-lists";

export default function HomePage() {
  const { data: lists, isLoading } = useLists();
  const { signOut } = useAppUser();
  const [newListOpen, setNewListOpen] = useState(false);
  const appearingIds = useAppearingIds((lists ?? []).map((list) => list.id));

  return (
    <div className={`flex min-h-screen flex-col bg-background ${MOBILE_BOTTOM_NAV_PADDING}`}>
      <AppHeader title="My Lists" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <NewListInlineButton onClick={() => setNewListOpen(true)} />

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[74px] w-full rounded-xl" />
            <Skeleton className="h-[74px] w-full rounded-xl" />
          </div>
        ) : lists && lists.length > 0 ? (
          <div className="flex flex-col gap-3">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                animateEnter={appearingIds.has(list.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
            <ClipboardList className="size-10 opacity-50" />
            <p className="max-w-xs text-sm">
              No lists yet. Tap <span className="font-medium text-primary">New list</span> below to
              get started.
            </p>
          </div>
        )}
      </main>

      <NewListDialog open={newListOpen} onOpenChange={setNewListOpen} />

      <MobileBottomNav
        left={{
          icon: LayoutList,
          label: "Lists",
          active: true,
          disabled: true,
        }}
        center={{
          icon: Plus,
          label: "New list",
          onClick: () => setNewListOpen(true),
        }}
        right={{
          icon: LogOut,
          label: "Sign out",
          onClick: () => signOut({ redirectUrl: "/sign-in" }),
        }}
      />
    </div>
  );
}
