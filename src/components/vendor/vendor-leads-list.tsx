"use client";

import { LeadConversation } from "@/components/chat/lead-conversation";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { LeadStatus, VendorLeadRow } from "@/lib/supabase/database.types";
import { Lock, MessageSquare, Star } from "lucide-react";
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
  hasSubscription = false,
}: {
  initial: VendorLeadRow[];
  unlockPriceRON: number;
  hasSubscription?: boolean;
}) {
  const [leads, setLeads] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

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
      const res = await api.post<{
        url: string | null;
        unlocked?: boolean;
        contact?: { email: string | null; phone: string | null };
      }>(`/leads/${id}/unlock`, {});
      if (res.url) {
        // Flux CPL: redirect către Stripe Checkout.
        window.location.assign(res.url);
        return;
      }
      if (res.unlocked) {
        // Abonament activ: deblocare instant, actualizăm rândul local.
        setLeads((ls) =>
          ls.map((l) =>
            l.id === id
              ? {
                  ...l,
                  is_unlocked_by_vendor: true,
                  status: l.status === "new" ? "unlocked" : l.status,
                  client_email: res.contact?.email ?? l.client_email,
                  client_phone: res.contact?.phone ?? l.client_phone,
                }
              : l,
          ),
        );
        setBusyId(null);
        return;
      }
      setError("Nu s-a putut debloca contactul.");
      setBusyId(null);
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setChatId((c) => (c === l.id ? null : l.id))
                  }
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {chatId === l.id ? "Închide chat" : "Conversație"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReviewId((r) => (r === l.id ? null : l.id))
                  }
                >
                  <Star className="h-3.5 w-3.5" />
                  {reviewId === l.id ? "Închide" : "Recenzie client"}
                </Button>
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
                    ? "Se deblochează…"
                    : hasSubscription
                      ? "Deblochează (inclus în abonament)"
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

          {l.is_unlocked_by_vendor && chatId === l.id && (
            <div className="mt-3">
              <LeadConversation leadId={l.id} role="vendor" />
            </div>
          )}

          {l.is_unlocked_by_vendor && reviewId === l.id && (
            <div className="mt-3">
              <ReviewForm
                leadId={l.id}
                vendorId={l.vendor_id}
                weddingId={l.wedding_id}
                authorRole="vendor"
                targetLabel="acest cuplu"
              />
            </div>
          )}
        </li>
        ))}
      </ul>
    </>
  );
}
