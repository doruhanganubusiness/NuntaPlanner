"use client";

import { OPEN_CONSENT_EVENT } from "@/components/consent/consent-banner";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";
import { useEffect, useState } from "react";

/**
 * Buton flotant „biscuite mușcat" în colțul din stânga-jos. Apare DOAR după ce
 * utilizatorul a luat o decizie privind cookie-urile (există `np_consent`), iar
 * la click redeschide panoul de preferințe (același eveniment ca „Setări cookies").
 */
export function CookieFloatingButton() {
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    let active = true;
    // Amânat într-un microtask ca să nu fie un setState sincron în efect.
    queueMicrotask(() => {
      if (active && readConsent()) setDecided(true);
    });
    const onDecision = () => setDecided(true);
    window.addEventListener(CONSENT_EVENT, onDecision);
    return () => {
      active = false;
      window.removeEventListener(CONSENT_EVENT, onDecision);
    };
  }, []);

  if (!decided) return null;

  return (
    <button
      type="button"
      aria-label="Preferințe cookie-uri"
      title="Preferințe cookie-uri"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="fixed bottom-4 left-4 z-50 rounded-full p-1 opacity-60 drop-shadow-md transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <BittenCookie />
    </button>
  );
}

/** Iconiță SVG: biscuite (cookie) cu o mușcătură în colțul din dreapta-sus. */
function BittenCookie() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        {/* Masca decupează „mușcătura" din biscuite. */}
        <mask id="np-cookie-bite">
          <rect width="32" height="32" fill="white" />
          <circle cx="28" cy="5" r="7" fill="black" />
        </mask>
      </defs>
      {/* Corpul biscuitelui */}
      <circle
        cx="15"
        cy="16"
        r="13"
        fill="#c79a63"
        stroke="#9c6f3e"
        strokeWidth="1"
        mask="url(#np-cookie-bite)"
      />
      {/* Bucățele de ciocolată */}
      <circle cx="11" cy="12" r="1.7" fill="#5b3a1e" />
      <circle cx="18.5" cy="17" r="1.9" fill="#5b3a1e" />
      <circle cx="12" cy="21" r="1.5" fill="#5b3a1e" />
      <circle cx="20" cy="21.5" r="1.4" fill="#5b3a1e" />
      <circle cx="16" cy="11" r="1.2" fill="#5b3a1e" />
    </svg>
  );
}
