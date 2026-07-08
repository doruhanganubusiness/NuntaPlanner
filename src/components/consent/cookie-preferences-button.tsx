"use client";

import { OPEN_CONSENT_EVENT } from "@/components/consent/consent-banner";

/**
 * Buton care redeschide bannerul de preferințe cookies. Folosit în footer și în
 * Politica de cookies, ca utilizatorul să-și poată schimba oricând consimțământul.
 */
export function CookiePreferencesButton({
  className,
  label = "Setări cookies",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className={
        className ??
        "text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
      }
    >
      {label}
    </button>
  );
}
