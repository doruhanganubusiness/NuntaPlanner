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

/**
 * Valori implicite intuitive pentru un slot, în funcție de tip:
 * doar petrecerea are alcool + masă completă + durată; ceremoniile nu.
 */
export function slotDefaults(type: SlotType): {
  title: string;
  serves_alcohol: boolean;
  serves_full_meal: boolean;
  duration_minutes: number | null;
} {
  switch (type) {
    case "reception":
      return {
        title: "Petrecere",
        serves_alcohol: true,
        serves_full_meal: true,
        duration_minutes: 600, // 10 ore
      };
    case "civil_ceremony":
      return {
        title: "Cununia civilă",
        serves_alcohol: false,
        serves_full_meal: false,
        duration_minutes: null,
      };
    case "religious_ceremony":
      return {
        title: "Cununia religioasă",
        serves_alcohol: false,
        serves_full_meal: false,
        duration_minutes: null,
      };
    case "baptism":
      return {
        title: "Botez",
        serves_alcohol: false,
        serves_full_meal: false,
        duration_minutes: null,
      };
  }
}

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
