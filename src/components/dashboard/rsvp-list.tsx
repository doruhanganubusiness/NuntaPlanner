"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { RsvpRow } from "@/lib/supabase/database.types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function RsvpList({ initial }: { initial: RsvpRow[] }) {
  const [rsvps, setRsvps] = useState(initial);

  const confirmed = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const adults = confirmed.reduce((s, r) => s + r.adults_count, 0);
  const children = confirmed.reduce((s, r) => s + r.children_count, 0);

  async function remove(id: string) {
    await createClient().from("rsvps").delete().eq("id", id);
    setRsvps((r) => r.filter((x) => x.id !== id));
  }

  if (rsvps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Încă nicio confirmare. Trimite invitația și răspunsurile apar aici.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="rounded-md bg-success/15 px-3 py-1 text-success">
          {confirmed.length} confirmări · {adults + children} persoane (
          {adults} adulți, {children} copii)
        </span>
        {declined.length > 0 && (
          <span className="rounded-md bg-muted px-3 py-1 text-muted-foreground">
            {declined.length} nu pot ajunge
          </span>
        )}
      </div>

      <ul className="divide-y divide-border rounded-md border border-border">
        {rsvps.map((r) => (
          <li key={r.id} className="flex items-start justify-between px-3 py-2.5">
            <div className="text-sm">
              <p className="font-medium">
                {r.guest_name}{" "}
                {r.attending ? (
                  <span className="text-success">
                    · {r.adults_count} adulți
                    {r.children_count > 0 && `, ${r.children_count} copii`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">· nu poate</span>
                )}
              </p>
              {r.message && (
                <p className="text-xs text-muted-foreground">„{r.message}”</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(r.id)}
              aria-label="Șterge confirmarea"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
