"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { useState } from "react";

export function SubscriptionPanel({
  active,
  cancelled,
  nextRenewalDate,
  monthlyRON,
  tierLabel,
}: {
  active: boolean;
  cancelled: boolean;
  nextRenewalDate: string | null;
  monthlyRON: number;
  tierLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.post<{ url: string | null }>(
        "/subscriptions",
        {},
      );
      if (url) window.location.assign(url);
      else {
        setError("Nu s-a putut porni plata.");
        setBusy(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await api.patch("/subscriptions", {});
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
      setBusy(false);
    }
  }

  const renewal = nextRenewalDate
    ? new Date(nextRenewalDate).toLocaleDateString("ro-RO")
    : null;

  if (!active) {
    return (
      <div className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-sm text-muted-foreground">
          Nu ai abonament activ. Deblochezi lead-urile plătind {tierLabel}{" "}
          per lead. Cu abonamentul, deblochezi contacte nelimitate.
        </p>
        <Button onClick={subscribe} disabled={busy}>
          {busy ? "Se deschide…" : `Activează abonamentul (${monthlyRON} RON/lună)`}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
        Abonament activ — deblochezi contactele nelimitat.
        {renewal &&
          (cancelled
            ? ` Rămâne valabil până pe ${renewal}, apoi se oprește.`
            : ` Se reînnoiește pe ${renewal}.`)}
      </div>
      {!cancelled && (
        <Button variant="outline" onClick={cancel} disabled={busy}>
          {busy ? "Se procesează…" : "Anulează abonamentul"}
        </Button>
      )}
    </div>
  );
}
