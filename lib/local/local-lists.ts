/**
 * Local-only data store for the test account. Mirrors the shape/behavior of
 * `lib/firestore/lists.ts` but persists everything to `localStorage` instead
 * of Firestore, so test sessions need no Firebase project, credentials, or
 * network access whatsoever.
 */
import { computeListTotals, computeSectionTotal } from "@/lib/calc";
import type { Item, ListDoc, Section } from "@/lib/types";

const STORAGE_KEY = "tally:local-lists";
export const LOCAL_LIST_ID_PREFIX = "local-list-";

function newId() {
  return crypto.randomUUID();
}

/** True for list ids created locally (never a real Firestore doc id). */
export function isLocalListId(listId: string): boolean {
  return listId.startsWith(LOCAL_LIST_ID_PREFIX);
}

type Store = Record<string, ListDoc>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore write failures (e.g. storage disabled/full).
  }
  notify();
}

const listListeners = new Set<() => void>();

function notify() {
  listListeners.forEach((listener) => listener());
}

function withRecomputedTotals(sections: Section[]) {
  const recalced = sections.map((section) => ({
    ...section,
    total: computeSectionTotal(section.items),
  }));
  const totals = computeListTotals(recalced);
  return { sections: recalced, ...totals };
}

export function getLocalLists(userId: string): ListDoc[] {
  return Object.values(readStore()).filter((list) => list.userId === userId);
}

export function getLocalList(listId: string): ListDoc | null {
  return readStore()[listId] ?? null;
}

/** Behaves like Firestore's `onSnapshot` for a user's lists query. */
export function subscribeToLocalLists(
  userId: string,
  callback: (lists: ListDoc[]) => void
): () => void {
  const emit = () => callback(getLocalLists(userId));
  emit();

  listListeners.add(emit);
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listListeners.delete(emit);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => listListeners.delete(emit);
}

/** Behaves like Firestore's `onSnapshot` for a single list document. */
export function subscribeToLocalList(
  listId: string,
  callback: (list: ListDoc | null) => void
): () => void {
  const emit = () => callback(getLocalList(listId));
  emit();

  listListeners.add(emit);
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listListeners.delete(emit);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => listListeners.delete(emit);
}

function updateList(listId: string, updates: Partial<Omit<ListDoc, "id">>) {
  const store = readStore();
  const existing = store[listId];
  if (!existing) return;
  store[listId] = { ...existing, ...updates };
  writeStore(store);
}

export async function createLocalList(userId: string, title: string): Promise<string> {
  const id = `${LOCAL_LIST_ID_PREFIX}${newId()}`;
  const now = Date.now();
  const list: ListDoc = {
    id,
    userId,
    title,
    sections: [],
    total: 0,
    sectionCount: 0,
    itemCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const store = readStore();
  store[id] = list;
  writeStore(store);
  return id;
}

export async function renameLocalList(listId: string, title: string) {
  updateList(listId, { title, updatedAt: Date.now() });
}

export async function deleteLocalList(listId: string) {
  const store = readStore();
  delete store[listId];
  writeStore(store);
}

export async function addLocalSection(listId: string, currentSections: Section[], title: string) {
  const now = Date.now();
  const newSection: Section = {
    id: newId(),
    title,
    order: currentSections.length,
    total: 0,
    items: [],
    createdAt: now,
    updatedAt: now,
  };
  const { sections, total, sectionCount, itemCount } = withRecomputedTotals([
    ...currentSections,
    newSection,
  ]);
  updateList(listId, { sections, total, sectionCount, itemCount, updatedAt: now });
  return newSection.id;
}

export async function renameLocalSection(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  title: string
) {
  const now = Date.now();
  const nextSections = currentSections.map((section) =>
    section.id === sectionId ? { ...section, title, updatedAt: now } : section
  );
  updateList(listId, { sections: nextSections, updatedAt: now });
}

export async function deleteLocalSection(
  listId: string,
  currentSections: Section[],
  sectionId: string
) {
  const now = Date.now();
  const { sections, total, sectionCount, itemCount } = withRecomputedTotals(
    currentSections.filter((section) => section.id !== sectionId)
  );
  updateList(listId, { sections, total, sectionCount, itemCount, updatedAt: now });
}

export async function addLocalItem(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  name: string,
  price: number
) {
  const now = Date.now();
  const newItem: Item = { id: newId(), name, price, order: 0, createdAt: now, updatedAt: now };

  const updatedSections = currentSections.map((section) => {
    if (section.id !== sectionId) return section;
    const items = [...section.items, { ...newItem, order: section.items.length }];
    return { ...section, items, total: computeSectionTotal(items), updatedAt: now };
  });

  const { sections, total, sectionCount, itemCount } = withRecomputedTotals(updatedSections);
  updateList(listId, { sections, total, sectionCount, itemCount, updatedAt: now });
  return newItem.id;
}

export async function editLocalItem(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  itemId: string,
  updates: { name?: string; price?: number }
) {
  const now = Date.now();
  const updatedSections = currentSections.map((section) => {
    if (section.id !== sectionId) return section;
    const items = section.items.map((item) =>
      item.id === itemId ? { ...item, ...updates, updatedAt: now } : item
    );
    return { ...section, items, total: computeSectionTotal(items), updatedAt: now };
  });

  const { sections, total, sectionCount, itemCount } = withRecomputedTotals(updatedSections);
  updateList(listId, { sections, total, sectionCount, itemCount, updatedAt: now });
}

export async function deleteLocalItem(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  itemId: string
) {
  const now = Date.now();
  const updatedSections = currentSections.map((section) => {
    if (section.id !== sectionId) return section;
    const items = section.items.filter((item) => item.id !== itemId);
    return { ...section, items, total: computeSectionTotal(items), updatedAt: now };
  });

  const { sections, total, sectionCount, itemCount } = withRecomputedTotals(updatedSections);
  updateList(listId, { sections, total, sectionCount, itemCount, updatedAt: now });
}
