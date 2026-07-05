"use client";

import { Stars } from "@/components/reviews/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  author_role: "couple" | "vendor";
  created_at: string;
  vendorName: string;
};

export function AdminReviewList({ initial }: { initial: AdminReview[] }) {
  const [reviews, setReviews] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Ștergi definitiv această recenzie?")) return;
    setBusyId(id);
    setError(null);
    try {
      // RLS: reviews_delete_admin permite ștergerea doar adminului.
      const { error: delErr } = await createClient()
        .from("reviews")
        .delete()
        .eq("id", id);
      if (delErr) throw new Error(delErr.message);
      setReviews((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setBusyId(null);
    }
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Nicio recenzie încă.</p>;
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Stars value={r.rating} />
                  <Badge tone="muted">
                    {r.author_role === "couple"
                      ? "cuplu → furnizor"
                      : "furnizor → cuplu"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {r.vendorName} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("ro-RO")}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-2 max-w-2xl whitespace-pre-line text-sm">
                    {r.comment}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={busyId === r.id}
                onClick={() => remove(r.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                {busyId === r.id ? "Se șterge…" : "Șterge"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
