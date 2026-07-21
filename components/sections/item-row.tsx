"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/calc";
import { useDeleteItem, useEditItem } from "@/hooks/use-list";
import type { Item } from "@/lib/types";

export function ItemRow({
  listId,
  sectionId,
  item,
}: {
  listId: string;
  sectionId: string;
  item: Item;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  const editItem = useEditItem(listId);
  const deleteItem = useDeleteItem(listId);

  function startEdit() {
    setName(item.name);
    setPrice(String(item.price));
    setEditing(true);
  }

  async function save() {
    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    if (!trimmedName || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid name and price");
      return;
    }
    try {
      await editItem.mutateAsync({
        sectionId,
        itemId: item.id,
        updates: { name: trimmedName, price: parsedPrice },
      });
      setEditing(false);
    } catch {
      toast.error("Couldn't update item");
    }
  }

  async function remove() {
    try {
      await deleteItem.mutateAsync({ sectionId, itemId: item.id });
    } catch {
      toast.error("Couldn't delete item");
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="h-8 flex-1"
          autoFocus
        />
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          inputMode="decimal"
          className="h-8 w-24"
        />
        <Button size="icon-sm" variant="ghost" onClick={save} disabled={editItem.isPending}>
          <Check className="size-4" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}>
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 py-1.5">
      <p className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</p>
      <p className="text-sm font-medium text-foreground">{formatCurrency(item.price)}</p>
      <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
        <Button size="icon-sm" variant="ghost" onClick={startEdit} className="text-muted-foreground">
          <Pencil className="size-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={remove}
          disabled={deleteItem.isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
