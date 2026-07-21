"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { onSnapshot } from "firebase/firestore";
import { useFirebaseSync } from "@/components/providers/firebase-sync";
import {
  createList as createListFn,
  deleteList as deleteListFn,
  listsQuery,
  renameList as renameListFn,
} from "@/lib/firestore/lists";
import type { ListDoc } from "@/lib/types";

export function listsQueryKey(uid: string | null) {
  return ["lists", uid] as const;
}

/**
 * Subscribes to the current user's lists in realtime and exposes them
 * through TanStack Query's cache. Firestore's client SDK applies writes to
 * its local cache optimistically, so mutations feel instant even though we
 * don't hand-roll optimistic cache patches here.
 */
export function useLists() {
  const { uid, ready } = useFirebaseSync();
  const queryClient = useQueryClient();
  const queryKey = listsQueryKey(uid);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      listsQuery(uid),
      (snapshot) => {
        const lists = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ListDoc)
          .sort((a, b) => b.updatedAt - a.updatedAt);
        queryClient.setQueryData(queryKey, lists);
      },
      (error) => {
        console.error("Failed to subscribe to lists", error);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const query = useQuery<ListDoc[]>({
    queryKey,
    queryFn: () => queryClient.getQueryData<ListDoc[]>(queryKey) ?? [],
    enabled: ready && !!uid,
  });

  return {
    ...query,
    isLoading: !ready || (!!uid && query.data === undefined),
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
