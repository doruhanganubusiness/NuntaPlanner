"use client";

import { LeadConversation } from "@/components/chat/lead-conversation";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LeadStatus } from "@/lib/supabase/database.types";
import { categoryLabel } from "@/lib/vendors/categories";
import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Trimisă",
  unlocked: "Deblocată",
  contacted: "Contactat",
  converted: "Convertit",
  lost: "Pierdut",
};

export type CoupleLead = {
  id: string;
  status: LeadStatus;
  vendorName: string;
  vendorId: string;
  weddingId: string;
  category: string | null;
};

export function CoupleConversations({ leads }: { leads: CoupleLead[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-border">
      {leads.map((l) => (
        <li key={l.id} className="py-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span>
              {l.vendorName}
              {l.category && (
                <span className="text-muted-foreground">
                  {" "}
                  · {categoryLabel(l.category)}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Badge tone={l.status === "converted" ? "success" : "muted"}>
                {STATUS_LABEL[l.status]}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenId((o) => (o === l.id ? null : l.id))}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {openId === l.id ? "Închide" : "Mesaje"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReviewId((r) => (r === l.id ? null : l.id))}
              >
                <Star className="h-3.5 w-3.5" />
                {reviewId === l.id ? "Închide" : "Recenzie"}
              </Button>
            </div>
          </div>

          {openId === l.id && (
            <div className="mt-3">
              <LeadConversation leadId={l.id} role="couple" />
            </div>
          )}

          {reviewId === l.id && (
            <div className="mt-3">
              <ReviewForm
                leadId={l.id}
                vendorId={l.vendorId}
                weddingId={l.weddingId}
                authorRole="couple"
                targetLabel={l.vendorName}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
