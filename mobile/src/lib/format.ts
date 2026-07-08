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

export const SLOT_TYPE_OPTIONS: { value: SlotTypeDb; label: string }[] = [
  { value: "civil_ceremony", label: "Cununia civilă" },
  { value: "religious_ceremony", label: "Cununia religioasă" },
  { value: "baptism", label: "Botez" },
  { value: "reception", label: "Petrecere" },
];

/** Valori implicite pentru un slot nou, în funcție de tip (ca pe site). */
export function slotDefaults(type: SlotTypeDb): {
  title: string;
  serves_alcohol: boolean;
  serves_full_meal: boolean;
  duration_minutes: number | null;
} {
  if (type === "reception")
    return {
      title: "Petrecere",
      serves_alcohol: true,
      serves_full_meal: true,
      duration_minutes: 600,
    };
  return {
    title: SLOT_LABELS[type],
    serves_alcohol: false,
    serves_full_meal: false,
    duration_minutes: null,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  "coafor-makeup": "Coafor & Makeup",
  papetarie: "Papetărie & Invitații",
  "decor-baloane": "Decor & Baloane",
  "candy-bar": "Dulciuri & Candy Bar",
  tort: "Tort & Patiserie",
  tinute: "Ținute & Închiriere costume",
  transport: "Transport & Mașini",
  fotograf: "Fotograf",
  videograf: "Videograf",
  dj: "DJ & Sound",
  florar: "Florar & Designer floral",
  animator: "Animator & Entertainer",
  "photo-booth": "Photo Booth",
  "planner-partial": "Planner & Coordonator parțial",
  "mobilier-exterior": "Gazebo & Mobilier exterior",
  "restaurant-catering": "Restaurant & Catering",
  "sala-locatie": "Ballroom & Locație eveniment",
  formatie: "Formație live & Cântăreți",
  "planner-full": "Planificator full-service",
  honeymoon: "Honeymoon & Travel",
  bijuterii: "Inele & Bijuterii",
};

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

export const MEMBER_ROLE_OPTIONS = [
  { value: "bride", label: "Mireasă" },
  { value: "groom", label: "Mire" },
  { value: "parent", label: "Părinte" },
  { value: "godparent", label: "Naș" },
  { value: "viewer", label: "Vizitator" },
];

export const MEMBER_PERMISSION_OPTIONS = [
  { value: "viewer", label: "Doar vizualizare" },
  { value: "editor", label: "Editare" },
];

export function roleLabel(role: string): string {
  return MEMBER_ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}
