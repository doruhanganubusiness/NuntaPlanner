"use client";

import { LeadConversation } from "@/components/chat/lead-conversation";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export type VendorConversation = {
  id: string;
  clientEmail: string | null;
  clientPhone: string | null;
  region: string | null;
  eventDate: string | null;
  createdAt: string;
};

/**
 * Mesageria furnizorului: toate conversațiile (lead-uri deblocate) într-un singur
 * loc. Listă la stânga (desktop) / sus (mobil) + firul de chat selectat.
 */
export function VendorMessages({
  conversations,
}: {
  conversations: VendorConversation[];
}) {
  const [selected, setSelected] = useState<string | null>(
    conversations[0]?.id ?? null,
  );

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Nicio conversație încă. Poți scrie unui cuplu după ce îi deblochezi
          cererea din pagina de lead-uri.
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
                <p className="truncate text-sm font-medium">
                  {c.clientEmail ?? "Client"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[c.region, c.eventDate].filter(Boolean).join(" · ") ||
                    "Cerere"}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        {active ? (
          <>
            <div className="mb-2 text-sm text-muted-foreground">
              Conversație cu <b>{active.clientEmail ?? "client"}</b>
              {active.clientPhone ? ` · ${active.clientPhone}` : ""}
            </div>
            <LeadConversation leadId={active.id} role="vendor" />
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
