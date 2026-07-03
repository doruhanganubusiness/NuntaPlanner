"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, Send } from "lucide-react";
import { useState } from "react";

/**
 * Butoane de partajare a invitației: WhatsApp + copiere link.
 * Dacă `url` lipsește, folosește adresa paginii curente (utile pe pagina publică).
 */
export function InvitationShare({
  url,
  couple,
  dateStr,
}: {
  url?: string;
  couple?: string | null;
  dateStr?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function link() {
    return url ?? (typeof window !== "undefined" ? window.location.href : "");
  }

  function shareWhatsApp() {
    const parts = [
      "Vă invităm cu drag la nunta noastră 💍",
      [couple, dateStr].filter(Boolean).join(" · "),
      `Vezi invitația: ${link()}`,
    ].filter(Boolean);
    const text = encodeURIComponent(parts.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiază linkul invitației:", link());
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={shareWhatsApp}>
        <Send className="h-4 w-4" /> Trimite pe WhatsApp
      </Button>
      <Button variant="outline" onClick={copy}>
        {copied ? (
          <>
            <Check className="h-4 w-4" /> Copiat
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Copiază link
          </>
        )}
      </Button>
    </div>
  );
}
