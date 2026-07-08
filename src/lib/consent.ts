/**
 * Logica de consimțământ pentru cookies (partajată de banner, buton de preferințe
 * și loader-ul de analytics). Fără dependențe de framework, ca să poată fi importată
 * atât din componente client, cât și din utilitare.
 *
 * Patru categorii (aliniate cu Google Consent Mode v2):
 *  - `necessary`  — mereu activă, nu se stochează (implicită).
 *  - `preferences`— functionality_storage + personalization_storage.
 *  - `statistics` — analytics_storage.
 *  - `marketing`  — ad_storage + ad_user_data + ad_personalization.
 *
 * Starea se salvează în cookie-ul `np_consent` (documentat în Politica de cookies),
 * ca să persiste 6 luni și să fie disponibil la fiecare navigare.
 */

export const CONSENT_COOKIE = "np_consent";
export const CONSENT_VERSION = 2;
const MAX_AGE_DAYS = 180;

/** Categoriile controlabile de utilizator („necessary" e mereu true, implicit). */
export type ConsentCategories = {
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
};

export type ConsentState = ConsentCategories & {
  version: number;
  /** Momentul deciziei (ms). */
  updatedAt: number;
};

/** Cheile categoriilor opționale, în ordinea de afișare. */
export const OPTIONAL_CATEGORIES = [
  "preferences",
  "statistics",
  "marketing",
] as const;

export const ALL_DENIED: ConsentCategories = {
  preferences: false,
  statistics: false,
  marketing: false,
};

export const ALL_GRANTED: ConsentCategories = {
  preferences: true,
  statistics: true,
  marketing: true,
};

/** Eveniment global emis când se schimbă consimțământul (ascultat de analytics/banner). */
export const CONSENT_EVENT = "np-consent-change";

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(value) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: parsed.version,
      preferences: !!parsed.preferences,
      statistics: !!parsed.statistics,
      marketing: !!parsed.marketing,
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeConsent(categories: ConsentCategories): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    preferences: !!categories.preferences,
    statistics: !!categories.statistics,
    marketing: !!categories.marketing,
    updatedAt: Date.now(),
  };
  if (typeof document !== "undefined") {
    const expires = new Date(
      Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    ).toUTCString();
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
      JSON.stringify(state),
    )}; path=/; expires=${expires}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  }
  return state;
}

/** Traduce categoriile în semnalele Google Consent Mode v2. */
export function toGtagConsent(
  categories: ConsentCategories,
): Record<string, "granted" | "denied"> {
  const g = (b: boolean) => (b ? "granted" : "denied");
  return {
    analytics_storage: g(categories.statistics),
    ad_storage: g(categories.marketing),
    ad_user_data: g(categories.marketing),
    ad_personalization: g(categories.marketing),
    functionality_storage: g(categories.preferences),
    personalization_storage: g(categories.preferences),
  };
}
