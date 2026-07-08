import type {
  MusicChoiceDb,
  SlotTypeDb,
  WeddingStyle,
} from "./types";

const numberFmt = new Intl.NumberFormat("ro-RO");

export function formatNum(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return numberFmt.format(Math.round(n));
}

export function formatRON(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${numberFmt.format(Math.round(n))} lei`;
}

export function musicLabel(m: MusicChoiceDb | null | undefined): string {
  switch (m) {
    case "dj":
      return "DJ";
    case "band":
      return "Formație";
    case "band_and_dj":
      return "Formație + DJ";
    default:
      return "—";
  }
}

export const SLOT_LABELS: Record<SlotTypeDb, string> = {
  civil_ceremony: "Cununie civilă",
  religious_ceremony: "Cununie religioasă",
  baptism: "Botez",
  reception: "Petrecere",
};

export const STYLE_LABELS: Record<WeddingStyle, string> = {
  classic: "Clasic",
  rustic: "Rustic",
  boho: "Boho",
  modern: "Modern",
  glamour: "Glamour",
  vintage: "Vintage",
  garden: "Grădină",
  traditional: "Tradițional",
};

export const WEDDING_TYPE_OPTIONS = [
  { value: "civil", label: "Cununie civilă" },
  { value: "religious", label: "Cununie religioasă" },
  { value: "baptism", label: "Botez" },
  { value: "party", label: "Petrecere" },
];
