"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFirebaseSync } from "@/components/providers/firebase-sync";
import {
  createList as createListFn,
  deleteList as deleteListFn,
  renameList as renameListFn,
  subscribeToLists,
} from "@/lib/data/lists-repo";
import type { ListDoc } from "@/lib/types";

export function listsQueryKey(uid: string | null) {
  return ["lists", uid] as const;
}

function toError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback);
}

/**
 * Subscribes to the current user's lists in realtime and exposes them
 * through TanStack Query's cache. For the local test account this reads
 * from `localStorage`; for everyone else it uses Firestore's client SDK,
 * which applies writes to its local cache optimistically so mutations feel
 * instant even though we don't hand-roll optimistic cache patches here.
 */
export function useLists() {
  const { uid, ready } = useFirebaseSync();
  const queryClient = useQueryClient();
  const queryKey = listsQueryKey(uid);
  const [retryKey, setRetryKey] = useState(0);
  const [subscribeError, setSubscribeError] = useState<Error | null>(null);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null);
  const subscriptionId = `${uid ?? ""}:${retryKey}`;

  useEffect(() => {
    if (!uid) return;

    const currentSubscriptionId = `${uid}:${retryKey}`;

    const unsubscribe = subscribeToLists(
      uid,
      (lists) => {
        setSubscribeError(null);
        setActiveSubscriptionId(currentSubscriptionId);
        queryClient.setQueryData(queryKey, lists);
      },
      (error) => {
        console.error("Failed to subscribe to lists", error);
        setSubscribeError(toError(error, "Failed to load lists"));
        setActiveSubscriptionId(currentSubscriptionId);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, retryKey]);

  const query = useQuery<ListDoc[]>({
    queryKey,
    queryFn: () => queryClient.getQueryData<ListDoc[]>(queryKey) ?? [],
    enabled: ready && !!uid,
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
    isLoading: !ready || (!!uid && !hasSnapshot),
  };
}

export function useCreateList() {
  const { uid } = useFirebaseSync();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!uid) throw new Error("Not signed in");
      return createListFn(uid, title);
    },
  });
}

export function useRenameList() {
  return useMutation({
    mutationFn: async ({ listId, title }: { listId: string; title: string }) =>
      renameListFn(listId, title),
  });
}

export function useDeleteList() {
  return useMutation({
    mutationFn: async (listId: string) => deleteListFn(listId),
  });
}
