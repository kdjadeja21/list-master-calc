"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { onSnapshot } from "firebase/firestore";
import { useFirebaseSync } from "@/components/providers/firebase-sync";
import {
  addItem as addItemFn,
  addSection as addSectionFn,
  deleteItem as deleteItemFn,
  deleteSection as deleteSectionFn,
  editItem as editItemFn,
  listDocRef,
  renameSection as renameSectionFn,
} from "@/lib/firestore/lists";
import type { ListDoc } from "@/lib/types";

export function listQueryKey(listId: string) {
  return ["list", listId] as const;
}

export function useList(listId: string) {
  const { ready } = useFirebaseSync();
  const queryClient = useQueryClient();
  const queryKey = listQueryKey(listId);

  useEffect(() => {
    if (!listId || !ready) return;

    const unsubscribe = onSnapshot(
      listDocRef(listId),
      (snap) => {
        if (!snap.exists()) {
          queryClient.setQueryData(queryKey, null);
          return;
        }
        queryClient.setQueryData(queryKey, { id: snap.id, ...snap.data() } as ListDoc);
      },
      (error) => {
        console.error("Failed to subscribe to list", error);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, listId]);

  return useQuery<ListDoc | null>({
    queryKey,
    queryFn: () => queryClient.getQueryData<ListDoc | null>(queryKey) ?? null,
    enabled: ready,
  });
}

function useCurrentSections(listId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.getQueryData<ListDoc | null>(listQueryKey(listId))?.sections ?? [];
}

export function useAddSection(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async (title: string) => addSectionFn(listId, getSections(), title),
  });
}

export function useRenameSection(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async ({ sectionId, title }: { sectionId: string; title: string }) =>
      renameSectionFn(listId, getSections(), sectionId, title),
  });
}

export function useDeleteSection(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async (sectionId: string) =>
      deleteSectionFn(listId, getSections(), sectionId),
  });
}

export function useAddItem(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async ({
      sectionId,
      name,
      price,
    }: {
      sectionId: string;
      name: string;
      price: number;
    }) => addItemFn(listId, getSections(), sectionId, name, price),
  });
}

export function useEditItem(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async ({
      sectionId,
      itemId,
      updates,
    }: {
      sectionId: string;
      itemId: string;
      updates: { name?: string; price?: number };
    }) => editItemFn(listId, getSections(), sectionId, itemId, updates),
  });
}

export function useDeleteItem(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async ({ sectionId, itemId }: { sectionId: string; itemId: string }) =>
      deleteItemFn(listId, getSections(), sectionId, itemId),
  });
}
