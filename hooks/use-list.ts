"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFirebaseSync } from "@/components/providers/firebase-sync";
import {
  addItem as addItemFn,
  addSection as addSectionFn,
  deleteItem as deleteItemFn,
  deleteSection as deleteSectionFn,
  editItem as editItemFn,
  renameSection as renameSectionFn,
  subscribeToList,
} from "@/lib/data/lists-repo";
import { nextDefaultSectionTitle } from "@/lib/section-title";
import type { ListDoc } from "@/lib/types";

export function listQueryKey(listId: string) {
  return ["list", listId] as const;
}

function toError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback);
}

export function useList(listId: string) {
  const { ready } = useFirebaseSync();
  const queryClient = useQueryClient();
  const queryKey = listQueryKey(listId);
  const [retryKey, setRetryKey] = useState(0);
  const [subscribeError, setSubscribeError] = useState<Error | null>(null);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null);
  const subscriptionId = `${listId}:${retryKey}`;

  useEffect(() => {
    if (!listId || !ready) return;

    const currentSubscriptionId = `${listId}:${retryKey}`;

    const unsubscribe = subscribeToList(
      listId,
      (list) => {
        setSubscribeError(null);
        setActiveSubscriptionId(currentSubscriptionId);
        queryClient.setQueryData(queryKey, list);
      },
      (error) => {
        console.error("Failed to subscribe to list", error);
        setSubscribeError(toError(error, "Failed to load list"));
        setActiveSubscriptionId(currentSubscriptionId);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, listId, retryKey]);

  const query = useQuery<ListDoc | null>({
    queryKey,
    queryFn: () => queryClient.getQueryData<ListDoc | null>(queryKey) ?? null,
    enabled: ready,
  });

  const hasSnapshot = activeSubscriptionId === subscriptionId;

  return {
    ...query,
    isError: !!subscribeError && hasSnapshot,
    error: subscribeError,
    retry: () => {
      setSubscribeError(null);
      setRetryKey((key) => key + 1);
    },
    isLoading: !ready || (!hasSnapshot && !!listId),
  };
}

function useCurrentSections(listId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.getQueryData<ListDoc | null>(listQueryKey(listId))?.sections ?? [];
}

export function useAddSection(listId: string) {
  const getSections = useCurrentSections(listId);
  return useMutation({
    mutationFn: async (title?: string) => {
      const sections = getSections();
      const resolvedTitle = title?.trim() || nextDefaultSectionTitle(sections);
      return addSectionFn(listId, sections, resolvedTitle);
    },
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
