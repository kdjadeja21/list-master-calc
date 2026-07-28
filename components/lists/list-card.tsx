"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/calc";
import { useDeleteList, useRenameList } from "@/hooks/use-lists";
import { cn } from "@/lib/utils";
import type { ListDoc } from "@/lib/types";

export function ListCard({ list, animateEnter = false }: { list: ListDoc; animateEnter?: boolean }) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(list.title);
  const renameMutation = useRenameList();
  const deleteMutation = useDeleteList();

  const sectionsLabel = `${list.sectionCount} section${list.sectionCount === 1 ? "" : "s"}`;
  const itemsLabel = `${list.itemCount} item${list.itemCount === 1 ? "" : "s"}`;

  async function handleRename() {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await renameMutation.mutateAsync({ listId: list.id, title: trimmed });
      setRenameOpen(false);
      toast.success("List renamed");
    } catch {
      toast.error("Couldn't rename list");
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(list.id);
      setDeleteOpen(false);
      toast.success("List deleted");
    } catch {
      toast.error("Couldn't delete list");
    }
  }

  return (
    <>
      <div className={cn(animateEnter && "animate-tally-enter")}>
        <Card
          role="link"
          tabIndex={0}
          onClick={() => router.push(`/lists/${list.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(`/lists/${list.id}`);
          }}
          className="cursor-pointer px-4 transition-colors hover:bg-accent/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold text-foreground">
                {list.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {sectionsLabel} &middot; {itemsLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <p className="text-lg font-semibold text-primary">{formatCurrency(list.total)}</p>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" />}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onClick={() => {
                      setTitle(list.title);
                      setRenameOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename list</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rename-list-title">List name</Label>
            <Input
              id="rename-list-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={renameMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{list.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this list, all of its sections, and all items inside
              them. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
