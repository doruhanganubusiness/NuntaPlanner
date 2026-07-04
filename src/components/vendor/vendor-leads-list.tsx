"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { LeadStatus, VendorLeadRow } from "@/lib/supabase/database.types";
import { Lock } from "lucide-react";
import { useState } from "react";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Nou",
  unlocked: "Deblocat",
  contacted: "Contactat",
  converted: "Convertit",
  lost: "Pierdut",
};

export function VendorLeadsList({
  initial,
  unlockPriceRON,
}: {
  initial: VendorLeadRow[];
  unlockPriceRON: number;
}) {
  const [leads, setLeads] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: "contacted" | "converted" | "lost") {
    setBusyId(id);
    try {
      await api.patch(`/leads/${id}/status`, { status });
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    } finally {
      setBusyId(null);
    }
  }

  async function unlock(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const { url } = await api.post<{ url: string | null }>(
        `/leads/${id}/unlock`,
        {},
      );
      if (url) {
        window.location.assign(url);
      } else {
        setError("Nu s-a putut porni plata.");
        setBusyId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
      setBusyId(null);
    }
  }

  if (leads.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nu ai încă nicio cerere. Când un cuplu te contactează, cererea apare aici.
      </p>
    );
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      <ul className="space-y-3">
        {leads.map((l) => (
        <li key={l.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">
                {l.event_region ?? "Regiune nespecificată"}
                {l.event_date ? ` · ${l.event_date}` : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Primit: {new Date(l.created_at).toLocaleDateString("ro-RO")}
              </p>
            </div>
            <Badge tone={l.status === "converted" ? "success" : "muted"}>
              {STATUS_LABEL[l.status]}
            </Badge>
          </div>

          {l.message && (
            <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">
              {l.message}
            </p>
          )}

          {/* Contact mascat până la deblocare (Stripe — în curând). */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {l.is_unlocked_by_vendor ? (
              <>
                <span>{l.client_email}</span>
                {l.client_phone && <span>· {l.client_phone}</span>}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Contact ascuns
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === l.id}
                  onClick={() => unlock(l.id)}
                >
                  {busyId === l.id
                    ? "Se deschide…"
                    : `Deblochează (${unlockPriceRON} RON)`}
                </Button>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busyId === l.id}
              onClick={() => setStatus(l.id, "contacted")}
            >
              Contactat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busyId === l.id}
              onClick={() => setStatus(l.id, "converted")}
            >
              Convertit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busyId === l.id}
              onClick={() => setStatus(l.id, "lost")}
            >
              Pierdut
            </Button>
          </div>
        </li>
        ))}
      </ul>
    </>
  );
}
