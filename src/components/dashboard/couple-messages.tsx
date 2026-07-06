"use client";

import { LeadConversation } from "@/components/chat/lead-conversation";
import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/vendors/categories";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Trimisă",
  unlocked: "Deblocată",
  contacted: "Contactat",
  converted: "Convertit",
  lost: "Pierdut",
};

export type CoupleConversationItem = {
  id: string;
  vendorName: string;
  category: string | null;
  status: LeadStatus;
  createdAt: string;
};

/**
 * Mesageria mirilor: toate conversațiile cu furnizorii contactați, într-un singur
 * loc. Cuplul poate scrie oricând; furnizorul vede mesajele după ce deblochează
 * cererea. Layout master-detail (listă + firul selectat).
 */
export function CoupleMessages({
  conversations,
}: {
  conversations: CoupleConversationItem[];
}) {
  const [selected, setSelected] = useState<string | null>(
    conversations[0]?.id ?? null,
  );

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Nicio conversație încă. Contactează un furnizor din tab-ul „Furnizori”
          ca să începeți să vorbiți.
        </p>
      </div>
    );
  }

  const active = conversations.find((c) => c.id === selected);

  return (
    <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {conversations.map((c) => {
          const isActive = c.id === selected;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors",
                  isActive ? "bg-accent" : "hover:bg-muted",
                )}
              >
                <p className="truncate text-sm font-medium">{c.vendorName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.category ? categoryLabel(c.category) : "Furnizor"}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        {active ? (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Conversație cu <b>{active.vendorName}</b>
              <Badge tone={active.status === "converted" ? "success" : "muted"}>
                {STATUS_LABEL[active.status]}
              </Badge>
            </div>
            <LeadConversation leadId={active.id} role="couple" />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Alege o conversație din listă.
          </p>
        )}
      </div>
    </div>
  );
}
