import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Datele operatorului, folosite consistent în toate paginile legale.
 * ⚠️ Actualizează denumirea legală, CUI-ul și adresa cu datele reale ale firmei.
 */
export const OPERATOR = {
  brand: SITE_NAME,
  legalName: "O2 Digital",
  site: SITE_URL,
  siteLabel: SITE_URL.replace(/^https?:\/\//, ""),
  email: "contact@nuntaplanner.ro",
  dpoEmail: "gdpr@nuntaplanner.ro",
} as const;

/** Data ultimei actualizări afișată în antetul fiecărei politici. */
export const LAST_UPDATED = "8 iulie 2026";

/** Antet comun: titlu (H1) + data ultimei actualizări. */
export function LegalHeader({ title }: { title: string }) {
  return (
    <header className="border-b border-border pb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ultima actualizare: {LAST_UPDATED}
      </p>
    </header>
  );
}
