import type { Section } from "@/lib/types";

const DEFAULT_SECTION_PATTERN = /^Section\s+(\d+)$/i;

/**
 * Next default section title in the form "Section 01", "Section 02", …
 * Picks the smallest unused number so deletes don't leave confusing gaps reused incorrectly.
 */
export function nextDefaultSectionTitle(sections: Section[]): string {
  const used = new Set<number>();
  for (const section of sections) {
    const match = DEFAULT_SECTION_PATTERN.exec(section.title.trim());
    if (match) used.add(Number.parseInt(match[1], 10));
  }

  let next = 1;
  while (used.has(next)) next += 1;

  return `Section ${String(next).padStart(2, "0")}`;
}
