import type { Metadata } from "next";

/**
 * URL-ul canonic al site-ului (fără slash final).
 * Folosit pentru `metadataBase`, canonical și Open Graph.
 */
export const SITE_URL = "https://nuntaplanner.vercel.app";
export const SITE_NAME = "NuntaPlanner";

/**
 * Construiește un obiect `Metadata` complet pentru o pagină:
 * meta title + description, canonical, Open Graph și Twitter Card.
 *
 * Reguli impuse (nu doar convenție):
 * - `title` ≤ 59 caractere
 * - `description` ≤ 135 caractere
 * În dev aruncă eroare dacă sunt depășite, ca să nu ajungă în producție.
 */
export function pageMeta({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  /** Calea absolută din site, ex. "/pentru-miri/buget". Root = "/". */
  path: string;
  keywords?: string[];
}): Metadata {
  if (process.env.NODE_ENV !== "production") {
    if ([...title].length > 59) {
      throw new Error(`Meta title prea lung (${[...title].length} > 59): ${title}`);
    }
    if ([...description].length > 135) {
      throw new Error(
        `Meta description prea lung (${[...description].length} > 135): ${description}`,
      );
    }
  }

  const canonical = path === "/" ? "/" : path.replace(/\/$/, "");
  const url = `${SITE_URL}${canonical === "/" ? "" : canonical}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "ro_RO",
      url,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
