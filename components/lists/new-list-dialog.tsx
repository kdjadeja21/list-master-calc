"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCreateList } from "@/hooks/use-lists";

type NewListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewListDialog({ open, onOpenChange }: NewListDialogProps) {
  const [title, setTitle] = useState("");
  const router = useRouter();
  const createList = useCreateList();

  function setOpen(next: boolean) {
    onOpenChange(next);
    if (next) setTitle("");
  }

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const id = await createList.mutateAsync(trimmed);
      setOpen(false);
      setTitle("");
      router.push(`/lists/${id}`);
    } catch {
      toast.error("Couldn't create list");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new list</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="new-list-title">List name</Label>
          <Input
            id="new-list-title"
            placeholder="e.g. Wedding Budget"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createList.isPending}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewListInlineButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:bg-accent/40 hover:text-primary sm:flex"
    >
      <Plus className="size-4" />
      New list
    </button>
  );
}
