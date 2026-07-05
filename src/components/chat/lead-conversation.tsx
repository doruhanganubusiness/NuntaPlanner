"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { MessageRow, MessageSender } from "@/lib/supabase/database.types";
import { useEffect, useRef, useState } from "react";

/**
 * Firul de chat pentru un lead. Cuplul și furnizorul folosesc aceeași
 * componentă, parametrizată prin `role`. Live prin Supabase Realtime.
 */
export function LeadConversation({
  leadId,
  role,
}: {
  leadId: string;
  role: MessageSender;
}) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  function upsert(m: MessageRow) {
    setMessages((prev) =>
      prev.some((x) => x.id === m.id)
        ? prev
        : [...prev, m].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    );
  }

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at")
      .then(({ data }) => {
        if (!active) return;
        setMessages((data ?? []) as MessageRow[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`messages:${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => upsert(payload.new as MessageRow),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: insErr } = await supabase
        .from("messages")
        .insert({ lead_id: leadId, sender_role: role, body: text })
        .select("*")
        .single();
      if (insErr) throw insErr;
      upsert(data as MessageRow);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trimitere eșuată");
    } finally {
      setSending(false);
    }
  }

  const theirLabel = role === "vendor" ? "Client" : "Furnizor";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="max-h-80 space-y-2 overflow-y-auto p-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Se încarcă…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Niciun mesaj încă. Scrie primul mesaj mai jos.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === role;
            return (
              <div
                key={m.id}
                className={mine ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm " +
                    (mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  <p className="whitespace-pre-line">{m.body}</p>
                  <p
                    className={
                      "mt-1 text-[11px] " +
                      (mine ? "text-primary-foreground/70" : "text-muted-foreground")
                    }
                  >
                    {mine ? "Tu" : theirLabel} ·{" "}
                    {new Date(m.created_at).toLocaleString("ro-RO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Scrie un mesaj…"
          maxLength={4000}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="sm" disabled={sending || !body.trim()}>
          {sending ? "…" : "Trimite"}
        </Button>
      </form>
      {error && <p className="px-3 pb-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
