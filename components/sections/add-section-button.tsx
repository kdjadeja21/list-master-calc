"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAddSection } from "@/hooks/use-list";

/** Creates a section with a default name ("Section 01", …) — no name prompt. */
export function useAddSectionAction(listId: string) {
  const addSection = useAddSection(listId);

  async function addDefaultSection() {
    if (addSection.isPending) return;
    try {
      await addSection.mutateAsync(undefined);
    } catch {
      toast.error("Couldn't add section");
    }
  }

  return { addDefaultSection, isPending: addSection.isPending };
}

type AddSectionFabProps = {
  onClick: () => void;
  disabled?: boolean;
};

/** Desktop-only floating action button. Hidden on mobile when the footer nav is used. */
export function AddSectionFab({ onClick, disabled = false }: AddSectionFabProps) {
  return (
    <Button
      size="icon-lg"
      className="fixed bottom-6 right-6 z-30 hidden size-14 rounded-full shadow-lg sm:flex"
      onClick={onClick}
      disabled={disabled}
      aria-label="Add section"
    >
      <Plus className="size-6" />
    </Button>
  );
}
