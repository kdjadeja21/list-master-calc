/**
 * Data access facade used by the `useLists`/`useList` hooks. Routes to the
 * local, Firebase-free store for the test account (`isLocalUid`/
 * `isLocalListId`) and to Firestore for everyone else, so callers don't need
 * to know or care which backend a given user/list is using.
 */
import { onSnapshot } from "firebase/firestore";
import { isLocalUid } from "@/lib/local/local-auth";
import {
  addLocalItem,
  addLocalSection,
  createLocalList,
  deleteLocalItem,
  deleteLocalList,
  deleteLocalSection,
  editLocalItem,
  isLocalListId,
  renameLocalList,
  renameLocalSection,
  subscribeToLocalList,
  subscribeToLocalLists,
} from "@/lib/local/local-lists";
import {
  addItem as addFirestoreItem,
  addSection as addFirestoreSection,
  createList as createFirestoreList,
  deleteItem as deleteFirestoreItem,
  deleteList as deleteFirestoreList,
  deleteSection as deleteFirestoreSection,
  editItem as editFirestoreItem,
  listDocRef,
  listsQuery,
  renameList as renameFirestoreList,
  renameSection as renameFirestoreSection,
} from "@/lib/firestore/lists";
import type { ListDoc, Section } from "@/lib/types";

export function subscribeToLists(
  userId: string,
  callback: (lists: ListDoc[]) => void,
  onError?: (error: unknown) => void
): () => void {
  if (isLocalUid(userId)) {
    return subscribeToLocalLists(userId, callback);
  }
  return onSnapshot(
    listsQuery(userId),
    (snapshot) => {
      const lists = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ListDoc)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      callback(lists);
    },
    onError
  );
}

export function subscribeToList(
  listId: string,
  callback: (list: ListDoc | null) => void,
  onError?: (error: unknown) => void
): () => void {
  if (isLocalListId(listId)) {
    return subscribeToLocalList(listId, callback);
  }
  return onSnapshot(
    listDocRef(listId),
    (snap) => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as ListDoc) : null);
    },
    onError
  );
}

export async function createList(userId: string, title: string): Promise<string> {
  if (isLocalUid(userId)) return createLocalList(userId, title);
  return createFirestoreList(userId, title);
}

export async function renameList(listId: string, title: string) {
  if (isLocalListId(listId)) return renameLocalList(listId, title);
  return renameFirestoreList(listId, title);
}

export async function deleteList(listId: string) {
  if (isLocalListId(listId)) return deleteLocalList(listId);
  return deleteFirestoreList(listId);
}

export async function addSection(listId: string, currentSections: Section[], title: string) {
  if (isLocalListId(listId)) return addLocalSection(listId, currentSections, title);
  return addFirestoreSection(listId, currentSections, title);
}

export async function renameSection(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  title: string
) {
  if (isLocalListId(listId)) return renameLocalSection(listId, currentSections, sectionId, title);
  return renameFirestoreSection(listId, currentSections, sectionId, title);
}

export async function deleteSection(listId: string, currentSections: Section[], sectionId: string) {
  if (isLocalListId(listId)) return deleteLocalSection(listId, currentSections, sectionId);
  return deleteFirestoreSection(listId, currentSections, sectionId);
}

export async function addItem(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  name: string,
  price: number
) {
  if (isLocalListId(listId)) return addLocalItem(listId, currentSections, sectionId, name, price);
  return addFirestoreItem(listId, currentSections, sectionId, name, price);
}

export async function editItem(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  itemId: string,
  updates: { name?: string; price?: number }
) {
  if (isLocalListId(listId)) return editLocalItem(listId, currentSections, sectionId, itemId, updates);
  return editFirestoreItem(listId, currentSections, sectionId, itemId, updates);
}

export async function deleteItem(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  itemId: string
) {
  if (isLocalListId(listId)) return deleteLocalItem(listId, currentSections, sectionId, itemId);
  return deleteFirestoreItem(listId, currentSections, sectionId, itemId);
}
