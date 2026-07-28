"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddItem } from "@/hooks/use-list";

export function AddItemRow({ listId, sectionId }: { listId: string; sectionId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const addItem = useAddItem(listId);

  function close() {
    setOpen(false);
    setName("");
    setPrice("");
  }

  async function handleAdd() {
    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    if (!trimmedName || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid name and price");
      return;
    }
    try {
      await addItem.mutateAsync({ sectionId, name: trimmedName, price: parsedPrice });
      setName("");
      setPrice("");
      toast.success("Item added");
    } catch {
      toast.error("Couldn't add item");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 py-1.5 text-sm font-medium text-primary/90 transition-colors hover:text-primary"
      >
        <Plus className="size-3.5" />
        Add item
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5">
      <Input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="h-8 flex-1"
        autoFocus
      />
      <Input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        inputMode="decimal"
        className="h-8 w-24"
      />
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={handleAdd}
        disabled={addItem.isPending}
        aria-label="Save item"
      >
        <Check className="size-4" />
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={close} aria-label="Cancel">
        <X className="size-4" />
      </Button>
    </div>
  );
}
