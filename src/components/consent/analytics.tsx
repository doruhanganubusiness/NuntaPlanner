"use client";

import { CONSENT_EVENT, readConsent, type ConsentState } from "@/lib/consent";
import { useEffect } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __npAnalyticsLoaded?: boolean;
  }
}

/**
 * Încarcă Google Tag Manager / Analytics 4 DOAR după consimțământul pentru analiză.
 * Folosește Google Consent Mode v2: setează implicit „denied" pentru stocarea de
 * analiză/marketing și trece pe „granted" abia când utilizatorul acceptă.
 *
 * Configurabil prin variabilele de mediu `NEXT_PUBLIC_GTM_ID` și `NEXT_PUBLIC_GA_ID`
 * (fără ele, componenta nu face nimic — util în dezvoltare).
 */
export function Analytics() {
  useEffect(() => {
    if (!GTM_ID && !GA_ID) return;

    // Bootstrap dataLayer + gtag, o singură dată, cu consimțământ implicit refuzat.
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        wait_for_update: 500,
      });
      window.gtag("js", new Date());
    }

    const apply = (state: ConsentState | null) => {
      const granted = state?.analytics === true;
      window.gtag?.("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
      if (granted) loadTags();
    };

    apply(readConsent());

    const onChange = (e: Event) => apply((e as CustomEvent<ConsentState>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return null;
}

/** Injectează efectiv scripturile GTM/GA — o singură dată, după consimțământ. */
function loadTags() {
  if (window.__npAnalyticsLoaded) return;
  window.__npAnalyticsLoaded = true;

  if (GTM_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(s);
  }

  if (GA_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.gtag?.("config", GA_ID, { anonymize_ip: true });
  }
}
