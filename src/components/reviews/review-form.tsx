"use client";

import { StarInput } from "@/components/reviews/stars";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { MessageSender } from "@/lib/supabase/database.types";
import { useState } from "react";

/**
 * Formular de recenzie (1–5 + comentariu). Aceeași componentă pentru ambele
 * sensuri, parametrizată prin `authorRole`. O singură recenzie per (lead, autor).
 */
export function ReviewForm({
  leadId,
  vendorId,
  weddingId,
  authorRole,
  targetLabel,
}: {
  leadId: string;
  vendorId: string;
  weddingId: string;
  authorRole: MessageSender;
  targetLabel: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError("Alege un rating de la 1 la 5.");
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: insErr } = await supabase.from("reviews").insert({
        lead_id: leadId,
        vendor_id: vendorId,
        wedding_id: weddingId,
        author_role: authorRole,
        rating,
        comment: comment.trim() || null,
      });
      if (insErr) {
        throw new Error(
          insErr.code === "23505"
            ? "Ai lăsat deja o recenzie pentru această colaborare."
            : insErr.message,
        );
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
        Mulțumim pentru recenzie!
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-sm font-medium">Lasă o recenzie pentru {targetLabel}</p>
      <StarInput value={rating} onChange={setRating} />
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cum a fost colaborarea? (opțional)"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "Se trimite…" : "Trimite recenzia"}
      </Button>
    </form>
  );
}
