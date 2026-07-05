"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VendorReferralRow } from "@/lib/supabase/database.types";
import { Check, Copy, Send } from "lucide-react";
import { useState } from "react";

/**
 * Panoul „Recomandări" al furnizorului: linkul de invitație + lista invitaților
 * cu statusul lor. Când un invitat e verificat, invitatorul primește o lună de
 * abonament gratuită (max 5/lună) — recompensa se acordă automat pe server.
 */
export function ReferralPanel({
  code,
  referrals,
}: {
  code: string;
  referrals: VendorReferralRow[];
}) {
  const [copied, setCopied] = useState(false);

  function link() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/register?type=vendor&ref=${code}`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiază linkul de invitație:", link());
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Listează-ți afacerea pe NuntaPlanner și primești cereri de la miri: ${link()}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const rewardedThisMonth = referrals.filter(
    (r) =>
      r.status === "rewarded" &&
      r.reward_granted_at &&
      new Date(r.reward_granted_at) >= startOfMonth,
  ).length;
  const rewardedTotal = referrals.filter((r) => r.status === "rewarded").length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Linkul tău de invitație</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Trimite-l altor furnizori. Când se înregistrează prin el și sunt
          verificați de platformă, primești <b>o lună de abonament gratuită</b>.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-muted px-3 py-2 text-sm">
            {link()}
          </code>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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
          <Button onClick={shareWhatsApp}>
            <Send className="h-4 w-4" /> Trimite pe WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invitați" value={referrals.length} />
        <Stat label="Luni gratuite câștigate" value={rewardedTotal} />
        <Stat label="Recompense luna aceasta" value={`${rewardedThisMonth}/5`} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Invitații tăi</h2>
        {referrals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Încă nu ai invitat pe nimeni. Trimite linkul de mai sus ca să începi.
          </p>
        ) : (
          <ul className="space-y-2">
            {referrals.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{r.referred_business_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Invitat pe{" "}
                    {new Date(r.created_at).toLocaleDateString("ro-RO")}
                  </p>
                </div>
                {r.status === "rewarded" ? (
                  <Badge tone="success">Recompensat · lună gratuită</Badge>
                ) : r.referred_verified ? (
                  <Badge tone="success">Verificat</Badge>
                ) : (
                  <Badge tone="muted">În așteptare verificare</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
