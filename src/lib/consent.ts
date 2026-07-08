/**
 * Logica de consimțământ pentru cookies (partajată de banner, buton de preferințe
 * și loader-ul de analytics). Fără dependențe de framework, ca să poată fi importată
 * atât din componente client, cât și din utilitare.
 *
 * Starea se salvează într-un cookie `np_consent` (documentat în Politica de cookies),
 * ca să persiste 6 luni și să fie disponibil la fiecare navigare.
 */

export const CONSENT_COOKIE = "np_consent";
export const CONSENT_VERSION = 1;
const MAX_AGE_DAYS = 180;

/** Categoriile pe care le poate controla utilizatorul. „necessary" e mereu true. */
export type ConsentState = {
  version: number;
  analytics: boolean;
  /** Momentul deciziei (ms). Absent = utilizatorul nu a decis încă. */
  updatedAt: number;
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
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    analytics,
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
