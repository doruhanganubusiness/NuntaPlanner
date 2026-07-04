/**
 * Categoriile de furnizori și tier-urile de preț (specificație §9.2).
 * Fiecare categorie aparține unui singur tier; prețul CPL și abonamentul lunar
 * sunt derivate din tier. Model similar cu `src/lib/localities/counties.ts`.
 */

export type VendorTier = "budget" | "mid" | "premium";

export type VendorCategory = {
  slug: string;
  label: string;
  tier: VendorTier;
};

export const VENDOR_CATEGORIES: VendorCategory[] = [
  // TIER BUGET
  { slug: "coafor-makeup", label: "Coafor & Makeup", tier: "budget" },
  { slug: "papetarie", label: "Papetărie & Invitații", tier: "budget" },
  { slug: "decor-baloane", label: "Decor & Baloane", tier: "budget" },
  { slug: "candy-bar", label: "Dulciuri & Candy Bar", tier: "budget" },
  { slug: "tort", label: "Tort & Patiserie", tier: "budget" },
  { slug: "tinute", label: "Ținute & Închiriere costume", tier: "budget" },
  { slug: "transport", label: "Transport & Mașini", tier: "budget" },
  // TIER MEDIU
  { slug: "fotograf", label: "Fotograf", tier: "mid" },
  { slug: "videograf", label: "Videograf", tier: "mid" },
  { slug: "dj", label: "DJ & Sound", tier: "mid" },
  { slug: "florar", label: "Florar & Designer floral", tier: "mid" },
  { slug: "animator", label: "Animator & Entertainer", tier: "mid" },
  { slug: "photo-booth", label: "Photo Booth", tier: "mid" },
  { slug: "planner-partial", label: "Planner & Coordonator parțial", tier: "mid" },
  { slug: "mobilier-exterior", label: "Gazebo & Mobilier exterior", tier: "mid" },
  // TIER PREMIUM
  { slug: "restaurant-catering", label: "Restaurant & Catering", tier: "premium" },
  { slug: "sala-locatie", label: "Ballroom & Locație eveniment", tier: "premium" },
  { slug: "formatie", label: "Formație live & Cântăreți", tier: "premium" },
  { slug: "planner-full", label: "Planificator full-service", tier: "premium" },
  { slug: "honeymoon", label: "Honeymoon & Travel", tier: "premium" },
  { slug: "bijuterii", label: "Inele & Bijuterii", tier: "premium" },
];

export const TIER_PRICING: Record<
  VendorTier,
  { cplRON: number; monthlyRON: number; label: string }
> = {
  budget: { cplRON: 10, monthlyRON: 100, label: "Buget" },
  mid: { cplRON: 15, monthlyRON: 200, label: "Mediu" },
  premium: { cplRON: 30, monthlyRON: 500, label: "Premium" },
};

// Toate categoriile împreună (alfabetic), fără grupare pe tier — pentru selectoare.
export const VENDOR_CATEGORIES_SORTED = [...VENDOR_CATEGORIES].sort((a, b) =>
  a.label.localeCompare(b.label, "ro"),
);

export const CATEGORY_BY_SLUG = new Map(
  VENDOR_CATEGORIES.map((c) => [c.slug, c]),
);

export const VENDOR_CATEGORY_SLUGS = VENDOR_CATEGORIES.map((c) => c.slug);

export function tierForCategory(slug: string): VendorTier {
  return CATEGORY_BY_SLUG.get(slug)?.tier ?? "budget";
}

export function categoryLabel(slug: string): string {
  return CATEGORY_BY_SLUG.get(slug)?.label ?? slug;
}
