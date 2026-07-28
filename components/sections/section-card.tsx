"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { ItemRow } from "@/components/sections/item-row";
import { AddItemRow } from "@/components/sections/add-item-row";
import { formatCurrency } from "@/lib/calc";
import { useDeleteSection, useRenameSection } from "@/hooks/use-list";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/types";

export function SectionCard({
  listId,
  section,
  animateEnter = false,
}: {
  listId: string;
  section: Section;
  animateEnter?: boolean;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(section.title);
  const renameSection = useRenameSection(listId);
  const deleteSection = useDeleteSection(listId);

  async function handleRename() {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await renameSection.mutateAsync({ sectionId: section.id, title: trimmed });
      setRenameOpen(false);
      toast.success("Section renamed");
    } catch {
      toast.error("Couldn't rename section");
    }
  }

  async function handleDelete() {
    try {
      await deleteSection.mutateAsync(section.id);
      setDeleteOpen(false);
      toast.success("Section deleted");
    } catch {
      toast.error("Couldn't delete section");
    }
  }

  const sortedItems = [...section.items].sort((a, b) => a.order - b.order);

  return (
    <>
      <div
        className={cn(animateEnter && "animate-tally-enter")}
        data-section-id={section.id}
      >
        <Card className="px-4">
          <div className="flex items-center justify-between gap-2 pt-4">
            <p className="min-w-0 flex-1 truncate font-serif text-base font-semibold text-foreground">
              {section.title}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground"
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setTitle(section.title);
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
          <CardContent className="px-0 pt-3">
            <div className="flex flex-col divide-y divide-border/70">
              {sortedItems.map((item) => (
                <ItemRow key={item.id} listId={listId} sectionId={section.id} item={item} />
              ))}
            </div>
            <AddItemRow listId={listId} sectionId={section.id} />
            <Separator className="my-2" />
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm font-medium text-muted-foreground">Section Total</p>
              <p className="text-base font-semibold text-primary">{formatCurrency(section.total)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename section</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rename-section-title">Section name</Label>
            <Input
              id="rename-section-title"
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
            <Button onClick={handleRename} disabled={renameSection.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{section.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this section and all items inside it. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSection.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
