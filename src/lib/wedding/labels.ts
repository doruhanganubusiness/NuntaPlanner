import type { MusicRecommendation, SlotType } from "@/lib/engine";

/** Eticheta în română pentru recomandarea de muzică. */
export function musicLabel(rec: MusicRecommendation): string {
  switch (rec) {
    case "dj":
      return "DJ";
    case "band":
      return "Formație";
    case "band_and_dj":
      return "Formație + DJ";
  }
}

/** Eticheta în română pentru tipul de slot. */
export function slotTypeLabel(type: SlotType): string {
  switch (type) {
    case "civil_ceremony":
      return "Cununia civilă";
    case "religious_ceremony":
      return "Cununia religioasă";
    case "baptism":
      return "Botez";
    case "reception":
      return "Petrecere";
  }
}

export const SLOT_TYPE_OPTIONS: { value: SlotType; label: string }[] = [
  { value: "civil_ceremony", label: "Cununia civilă" },
  { value: "religious_ceremony", label: "Cununia religioasă" },
  { value: "baptism", label: "Botez" },
  { value: "reception", label: "Petrecere" },
];

export const WEDDING_STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "classic", label: "Clasic" },
  { value: "rustic", label: "Rustic" },
  { value: "boho", label: "Boho" },
  { value: "modern", label: "Modern" },
  { value: "glamour", label: "Glamour" },
  { value: "vintage", label: "Vintage" },
  { value: "garden", label: "Garden" },
  { value: "traditional", label: "Tradițional" },
];
