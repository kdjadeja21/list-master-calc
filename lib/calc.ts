import type { Item, Section } from "@/lib/types";

export function computeSectionTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.price) ? item.price : 0), 0);
}

export function computeListTotals(sections: Section[]) {
  const sectionCount = sections.length;
  let itemCount = 0;
  let total = 0;

  for (const section of sections) {
    itemCount += section.items.length;
    total += section.total;
  }

  return { total, sectionCount, itemCount };
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount || 0);
}
