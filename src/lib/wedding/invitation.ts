/** Utilitare pentru invitația digitală. */

/** Mesajul romantic implicit al invitației. */
export const DEFAULT_INVITATION_MESSAGE =
  "Cu inimile pline de bucurie, vă invităm să ne fiți alături în ziua în care spunem „DA” pentru totdeauna. Prezența voastră va face această zi de neuitat.";

/** Deduce numele cuplului din numele nunții (ex. „Nunta Ana & Andrei" → „Ana & Andrei"). */
export function defaultCouple(weddingName: string | null | undefined): string {
  if (!weddingName) return "";
  return weddingName.replace(/^\s*nunta\s+/i, "").trim();
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Ex. „Sâmbătă, 12 septembrie 2026". */
export function formatLongDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const s = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  return capitalize(s);
}

/** Ex. „18:30". */
export function formatTime(ts: string | null | undefined): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
