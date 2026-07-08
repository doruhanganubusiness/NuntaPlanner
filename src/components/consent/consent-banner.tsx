"use client";

import { readConsent, writeConsent } from "@/lib/consent";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Eveniment prin care butonul „Setări cookies" redeschide bannerul. */
export const OPEN_CONSENT_EVENT = "np-open-consent";

/**
 * Bannerul de consimțământ pentru cookies. Apare la prima vizită (când nu există
 * cookie-ul `np_consent`) și poate fi redeschis oricând din footer sau din Politica
 * de cookies. Oferă: Acceptă tot / Respinge neesențiale / Personalizează.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    let active = true;
    // Prima vizită: fără decizie salvată => afișăm bannerul. Amânat într-un
    // microtask ca să nu fie un setState sincron în corpul efectului (evită
    // atât hydration mismatch, cât și regula strictă react-hooks).
    queueMicrotask(() => {
      if (active && !readConsent()) setOpen(true);
    });

    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => {
      active = false;
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
    };
  }, []);

  if (!open) return null;

  const decide = (allowAnalytics: boolean) => {
    writeConsent(allowAnalytics);
    setOpen(false);
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Preferințe cookies"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
        <h2 className="text-base font-semibold">Îți respectăm confidențialitatea</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Folosim cookie-uri strict necesare pentru funcționarea site-ului și,
          cu acordul tău, cookie-uri de analiză (Google Analytics 4 prin Tag
          Manager) ca să înțelegem cum e folosit site-ul. Poți afla mai multe în{" "}
          <Link
            href="/politica-cookies"
            className="text-primary underline underline-offset-4"
          >
            Politica de cookies
          </Link>
          .
        </p>

        {details && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">Strict necesare</span>
                <span className="block text-xs text-muted-foreground">
                  Autentificare, securitate și reținerea preferințelor. Mereu
                  active.
                </span>
              </span>
              <input
                type="checkbox"
                checked
                disabled
                className="mt-1 h-4 w-4 accent-primary"
              />
            </label>
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">
                  Analiză și performanță
                </span>
                <span className="block text-xs text-muted-foreground">
                  Google Analytics 4 și Google Tag Manager, pentru statistici de
                  utilizare.
                </span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {details ? (
            <button
              type="button"
              onClick={() => decide(analytics)}
              className="order-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:order-none"
            >
              Salvează preferințele
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDetails(true)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Personalizează
            </button>
          )}
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Respinge neesențiale
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Acceptă tot
          </button>
        </div>
      </div>
    </div>
  );
}
