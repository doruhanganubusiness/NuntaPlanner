"use client";

import { InvitationShare } from "@/components/dashboard/invitation-share";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import {
  DEFAULT_INVITATION_MESSAGE,
  defaultCouple,
  formatLongDate,
} from "@/lib/wedding/invitation";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export function InvitationEditor({
  weddingId,
  weddingName,
  weddingDate,
  initialCouple,
  initialMessage,
  initialPublished,
}: {
  weddingId: string;
  weddingName: string;
  weddingDate: string | null;
  initialCouple: string | null;
  initialMessage: string | null;
  initialPublished: boolean;
}) {
  const [couple, setCouple] = useState(
    initialCouple || defaultCouple(weddingName),
  );
  const [message, setMessage] = useState(
    initialMessage || DEFAULT_INVITATION_MESSAGE,
  );
  const [published, setPublished] = useState(initialPublished);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/i/${weddingId}`
      : `/i/${weddingId}`;
  const dateStr = formatLongDate(weddingDate);

  async function save() {
    setStatus("saving");
    await api.patch(`/weddings/${weddingId}`, {
      invitation_couple: couple || null,
      invitation_message: message || null,
      invitation_published: published,
    });
    setStatus("saved");
  }

  return (
    <div className="space-y-5">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        Publică invitația (invitații o pot vedea prin link)
      </label>

      <div>
        <Label htmlFor="couple">Numele mirilor</Label>
        <Input
          id="couple"
          value={couple}
          placeholder="Ana & Andrei"
          onChange={(e) => setCouple(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="message">Mesajul invitației</Label>
        <Textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Data, locația și programul se preiau automat din nunta ta.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Se salvează…" : "Salvează"}
        </Button>
        {status === "saved" && (
          <span className="text-sm text-success">Salvat ✓</span>
        )}
      </div>

      {published ? (
        <div className="space-y-3 rounded-md border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Invitația ta e publicată 🎉</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Vezi invitația <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <InvitationShare url={url} couple={couple} dateStr={dateStr} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Publică invitația (bifează sus și salvează) ca să o poți trimite pe
          WhatsApp.
        </p>
      )}
    </div>
  );
}
