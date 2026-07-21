"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddSection } from "@/hooks/use-list";

type AddSectionDialogProps = {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Desktop-only floating action button. Hidden on mobile when footer is used. */
  showFab?: boolean;
};

export function AddSectionDialog({
  listId,
  open,
  onOpenChange,
  showFab = false,
}: AddSectionDialogProps) {
  const [title, setTitle] = useState("");
  const addSection = useAddSection(listId);

  function setOpen(next: boolean) {
    onOpenChange(next);
    if (next) setTitle("");
  }

  async function handleAdd() {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await addSection.mutateAsync(trimmed);
      setOpen(false);
      setTitle("");
    } catch {
      toast.error("Couldn't add section");
    }
  }

  return (
    <>
      {showFab ? (
        <Button
          size="icon-lg"
          className="fixed bottom-6 right-6 z-30 hidden size-14 rounded-full shadow-lg sm:flex"
          onClick={() => setOpen(true)}
          aria-label="Add section"
        >
          <Plus className="size-6" />
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a section</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-section-title">Section name</Label>
            <Input
              id="new-section-title"
              placeholder="e.g. Decoration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addSection.isPending}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
