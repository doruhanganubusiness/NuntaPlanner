import { COUNTIES, type County } from "@/lib/localities/counties";

/**
 * Slug URL-safe dintr-un nume românesc: elimină diacriticele (NFD), trece la
 * minuscule și înlocuiește orice non-alfanumeric cu „-". Ex: „Bistrița-Năsăud"
 * → „bistrita-nasaud", „Satu Mare" → „satu-mare".
 */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Trunchiază la n code-points, adăugând „…" dacă e nevoie. */
export function truncate(s: string, n: number): string {
  const arr = [...s];
  return arr.length <= n ? s : arr.slice(0, n - 1).join("") + "…";
}

/** Județele ordonate alfabetic (colație RO) — București între Brăila și Buzău. */
export const COUNTIES_SORTED: County[] = [...COUNTIES].sort((a, b) =>
  a.name.localeCompare(b.name, "ro"),
);

const COUNTY_BY_SLUG = new Map(COUNTIES.map((c) => [slugify(c.name), c]));

/** Găsește județul după slug (ex. „cluj", „bistrita-nasaud"). */
export function countyBySlug(slug: string): County | undefined {
  return COUNTY_BY_SLUG.get(slug);
}

/** Slug-ul unui județ din numele lui canonic. */
export function countySlug(county: County): string {
  return slugify(county.name);
}
