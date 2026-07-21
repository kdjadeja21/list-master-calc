export interface Item {
  id: string;
  name: string;
  price: number;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  total: number;
  items: Item[];
  createdAt: number;
  updatedAt: number;
}

export interface ListDoc {
  id: string;
  userId: string;
  title: string;
  sections: Section[];
  total: number;
  sectionCount: number;
  itemCount: number;
  createdAt: number;
  updatedAt: number;
}

export type ListSummary = Pick<
  ListDoc,
  "id" | "title" | "total" | "sectionCount" | "itemCount" | "updatedAt"
>;
