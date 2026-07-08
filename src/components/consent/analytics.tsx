"use client";

import {
  ALL_DENIED,
  CONSENT_EVENT,
  readConsent,
  toGtagConsent,
  type ConsentState,
} from "@/lib/consent";
import { useEffect } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __npConsentBooted?: boolean;
  }
}

/**
 * Google Consent Mode v2, complet funcțional.
 *
 * 1. Înainte de orice tag, setează consimțământul IMPLICIT pe „denied" pentru
 *    toate categoriile (mai puțin securitatea), cu `url_passthrough` și
 *    `ads_data_redaction` — așa Google folosește doar ping-uri fără cookies.
 * 2. Încarcă Google Tag Manager (și, opțional, GA4 direct), care respectă
 *    Consent Mode. Restul tag-urilor le configurezi tu în GTM.
 * 3. La decizia utilizatorului (banner), trimite `consent update` cu semnalele
 *    corespunzătoare celor 4 categorii.
 *
 * Fără `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA_ID` nu se încarcă nimic.
 */
export function Analytics() {
  useEffect(() => {
    if (!GTM_ID && !GA_ID) return;
    if (window.__npConsentBooted) return;
    window.__npConsentBooted = true;

    window.dataLayer = window.dataLayer || [];
    const gtag: (...args: unknown[]) => void = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag = gtag;

    // (1) Consimțământ implicit = denied (Consent Mode v2), înainte de tag-uri.
    gtag("consent", "default", {
      ...toGtagConsent(ALL_DENIED),
      security_storage: "granted",
      wait_for_update: 500,
    });
    gtag("set", "url_passthrough", true);
    gtag("set", "ads_data_redaction", true);
    gtag("js", new Date());

    // (3') Aplică o decizie deja salvată (dacă există).
    const stored = readConsent();
    if (stored) gtag("consent", "update", toGtagConsent(stored));

    // (2) Încarcă GTM și/sau GA4 — respectă Consent Mode.
    if (GTM_ID) {
      window.dataLayer.push({
        "gtm.start": Date.now(),
        event: "gtm.js",
      });
      injectScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
    }
    if (GA_ID) {
      injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      gtag("config", GA_ID, { anonymize_ip: true });
    }

    // (3) Reacționează la schimbările din banner.
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      window.gtag?.("consent", "update", toGtagConsent(detail));
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return null;
}

function injectScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}
