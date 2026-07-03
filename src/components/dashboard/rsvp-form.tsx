"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { Heart } from "lucide-react";
import { useState } from "react";

/** Formular de confirmare a prezenței (RSVP), afișat pe invitația publică. */
export function RsvpForm({ weddingId }: { weddingId: string }) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(true);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await api.post(`/invitations/${weddingId}/rsvp`, {
        guest_name: name,
        attending,
        adults_count: attending ? adults : 0,
        children_count: attending ? children : 0,
        message: message || null,
      });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Eroare");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-6 py-8 text-center">
        <Heart className="mx-auto h-6 w-6 fill-current text-[var(--primary)]" />
        <p className="mt-3 text-xl">Îți mulțumim pentru confirmare! 💕</p>
        <p className="text-[var(--muted-foreground)]">
          {attending
            ? "Abia așteptăm să sărbătorim împreună."
            : "Ne pare rău că nu poți ajunge — te vom avea în gând."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-[var(--border)] bg-white/70 px-6 py-8 text-left"
    >
      <h3
        className="text-center text-3xl text-[var(--primary)]"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Confirmă-ți prezența
      </h3>

      <div className="mt-5 space-y-4">
        <Input
          required
          placeholder="Numele tău"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex gap-4 text-base">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={attending}
              onChange={() => setAttending(true)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Vin cu drag
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!attending}
              onChange={() => setAttending(false)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Nu pot ajunge
          </label>
        </div>

        {attending && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
                Adulți (inclusiv tu)
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
                Copii
              </label>
              <Input
                type="number"
                min={0}
                max={50}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <Textarea
          rows={2}
          placeholder="Un gând pentru miri (opțional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Se trimite…" : "Trimite confirmarea"}
        </Button>
      </div>
    </form>
  );
}
