"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LayoutList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MOBILE_BOTTOM_NAV_PADDING,
  MobileBottomNav,
} from "@/components/layout/mobile-bottom-nav";
import { SectionCard } from "@/components/sections/section-card";
import { AddSectionDialog } from "@/components/sections/add-section-dialog";
import { useList } from "@/hooks/use-list";
import { formatCurrency } from "@/lib/calc";

export default function ListDetailPage() {
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const router = useRouter();
  const { data: list, isLoading } = useList(listId);
  const [addSectionOpen, setAddSectionOpen] = useState(false);

  const sortedSections = [...(list?.sections ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className={`flex min-h-screen flex-col bg-background ${MOBILE_BOTTOM_NAV_PADDING} sm:pb-28`}>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 text-muted-foreground sm:inline-flex"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p className="truncate font-serif text-lg font-semibold text-foreground">
                {list?.title ?? "List"}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Grand Total
            </p>
            {isLoading ? (
              <Skeleton className="ml-auto h-6 w-20" />
            ) : (
              <p className="text-xl font-bold text-primary">{formatCurrency(list?.total ?? 0)}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : list === null ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
            <p className="text-sm">This list doesn&apos;t exist or was deleted.</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to My Lists
            </Button>
          </div>
        ) : sortedSections.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
            <LayoutList className="size-10 opacity-50" />
            <p className="max-w-xs text-sm">
              No sections yet. Tap <span className="font-medium text-primary">Add section</span>{" "}
              below to create your first one.
            </p>
          </div>
        ) : (
          sortedSections.map((section) => (
            <SectionCard key={section.id} listId={listId} section={section} />
          ))
        )}
      </main>

      {list ? (
        <>
          <AddSectionDialog
            listId={listId}
            open={addSectionOpen}
            onOpenChange={setAddSectionOpen}
            showFab
          />
          <MobileBottomNav
            left={{
              icon: ArrowLeft,
              label: "Back",
              onClick: () => router.back(),
            }}
            center={{
              icon: Plus,
              label: "Add section",
              onClick: () => setAddSectionOpen(true),
            }}
            right={{
              icon: LayoutList,
              label: "Lists",
              onClick: () => router.push("/"),
            }}
          />
        </>
      ) : null}
    </div>
  );
}
