import { collection, deleteDoc, doc, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { computeListTotals, computeSectionTotal } from "@/lib/calc";
import type { Item, ListDoc, Section } from "@/lib/types";

function newId() {
  return crypto.randomUUID();
}

export function listsQuery(userId: string) {
  return query(collection(getFirebaseDb(), "lists"), where("userId", "==", userId));
}

export function listDocRef(listId: string) {
  return doc(getFirebaseDb(), "lists", listId);
}

function withRecomputedTotals(sections: Section[]) {
  const recalced = sections.map((section) => ({
    ...section,
    total: computeSectionTotal(section.items),
  }));
  const totals = computeListTotals(recalced);
  return { sections: recalced, ...totals };
}

export async function createList(userId: string, title: string): Promise<string> {
  const ref = doc(collection(getFirebaseDb(), "lists"));
  const now = Date.now();
  const data: Omit<ListDoc, "id"> = {
    userId,
    title,
    sections: [],
    total: 0,
    sectionCount: 0,
    itemCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, data);
  return ref.id;
}

export async function renameList(listId: string, title: string) {
  await updateDoc(listDocRef(listId), { title, updatedAt: Date.now() });
}

export async function deleteList(listId: string) {
  await deleteDoc(listDocRef(listId));
}

export async function addSection(listId: string, currentSections: Section[], title: string) {
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
  await updateDoc(listDocRef(listId), { sections, total, sectionCount, itemCount, updatedAt: now });
  return newSection.id;
}

export async function renameSection(
  listId: string,
  currentSections: Section[],
  sectionId: string,
  title: string
) {
  const now = Date.now();
  const nextSections = currentSections.map((section) =>
    section.id === sectionId ? { ...section, title, updatedAt: now } : section
  );
  await updateDoc(listDocRef(listId), { sections: nextSections, updatedAt: now });
}

export async function deleteSection(listId: string, currentSections: Section[], sectionId: string) {
  const now = Date.now();
  const { sections, total, sectionCount, itemCount } = withRecomputedTotals(
    currentSections.filter((section) => section.id !== sectionId)
  );
  await updateDoc(listDocRef(listId), { sections, total, sectionCount, itemCount, updatedAt: now });
}

export async function addItem(
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
  await updateDoc(listDocRef(listId), { sections, total, sectionCount, itemCount, updatedAt: now });
  return newItem.id;
}

export async function editItem(
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
  await updateDoc(listDocRef(listId), { sections, total, sectionCount, itemCount, updatedAt: now });
}

export async function deleteItem(
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
  await updateDoc(listDocRef(listId), { sections, total, sectionCount, itemCount, updatedAt: now });
}
