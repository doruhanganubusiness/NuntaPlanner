"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import type { EventSlotRow, SlotTypeDb } from "@/lib/supabase/database.types";
import { SLOT_TYPE_OPTIONS, slotDefaults } from "@/lib/wedding/labels";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Draft = Partial<EventSlotRow>;

export function SlotsManager({
  weddingId,
  initialSlots,
}: {
  weddingId: string;
  initialSlots: EventSlotRow[];
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<EventSlotRow[]>(initialSlots);
  const [busy, setBusy] = useState(false);

  async function addSlot() {
    setBusy(true);
    try {
      const { slot } = await api.post<{ slot: EventSlotRow }>(
        `/weddings/${weddingId}/slots`,
        {
          slot_type: "reception",
          title: "Petrecere",
          duration_minutes: 600,
          serves_alcohol: true,
          serves_full_meal: true,
          order_index: slots.length,
        },
      );
      setSlots((s) => [...s, slot]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeSlot(sid: string) {
    setBusy(true);
    try {
      await api.del(`/weddings/${weddingId}/slots/${sid}`);
      setSlots((s) => s.filter((x) => x.id !== sid));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function patchLocal(sid: string, patch: Draft) {
    setSlots((s) => s.map((x) => (x.id === sid ? { ...x, ...patch } : x)));
  }

  return (
    <div className="space-y-4">
      {slots.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Niciun eveniment încă. Adaugă cununia, botezul sau petrecerea.
        </p>
      )}

      {slots.map((slot) => (
        <SlotCard
          key={slot.id}
          weddingId={weddingId}
          slot={slot}
          onLocalChange={(p) => patchLocal(slot.id, p)}
          onDelete={() => removeSlot(slot.id)}
          onSaved={() => router.refresh()}
        />
      ))}

      <Button onClick={addSlot} disabled={busy} variant="outline">
        + Adaugă eveniment
      </Button>
    </div>
  );
}

function SlotCard({
  weddingId,
  slot,
  onLocalChange,
  onDelete,
  onSaved,
}: {
  weddingId: string;
  slot: EventSlotRow;
  onLocalChange: (p: Draft) => void;
  onDelete: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch(`/weddings/${weddingId}/slots/${slot.id}`, {
        slot_type: slot.slot_type,
        title: slot.title ?? null,
        slot_time: slot.slot_time ? slot.slot_time.slice(0, 5) : null,
        duration_minutes: slot.duration_minutes,
        location_name: slot.location_name ?? null,
        location_address: slot.location_address ?? null,
        guests_adults: slot.guests_adults,
        guests_children: slot.guests_children,
        serves_alcohol: slot.serves_alcohol,
        serves_full_meal: slot.serves_full_meal,
      });
      setSaved(true);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const isReception = slot.slot_type === "reception";

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Tip eveniment</Label>
              <Select
                value={slot.slot_type}
                onChange={(e) => {
                  const t = e.target.value as SlotTypeDb;
                  const d = slotDefaults(t);
                  // Titlul + alcool/masă/durată se ajustează automat după tip.
                  onLocalChange({
                    slot_type: t,
                    title: d.title,
                    serves_alcohol: d.serves_alcohol,
                    serves_full_meal: d.serves_full_meal,
                    duration_minutes: d.duration_minutes,
                  });
                }}
              >
                {SLOT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Titlu</Label>
              <Input
                value={slot.title ?? ""}
                onChange={(e) => onLocalChange({ title: e.target.value })}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Șterge eveniment"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Ora</Label>
            <Input
              type="time"
              value={slot.slot_time ? slot.slot_time.slice(0, 5) : ""}
              onChange={(e) =>
                onLocalChange({ slot_time: e.target.value || null })
              }
            />
          </div>
          <div>
            <Label>Adulți</Label>
            <Input
              type="number"
              min={0}
              value={slot.guests_adults}
              onChange={(e) =>
                onLocalChange({ guests_adults: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Copii</Label>
            <Input
              type="number"
              min={0}
              value={slot.guests_children}
              onChange={(e) =>
                onLocalChange({ guests_children: Number(e.target.value) })
              }
            />
          </div>
          {isReception && (
            <div>
              <Label>Durată (ore)</Label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={
                  slot.duration_minutes != null
                    ? slot.duration_minutes / 60
                    : ""
                }
                onChange={(e) =>
                  onLocalChange({
                    duration_minutes: e.target.value
                      ? Math.round(Number(e.target.value) * 60)
                      : null,
                  })
                }
              />
            </div>
          )}
        </div>

        <div>
          <Label>Locație (nume)</Label>
          <Input
            value={slot.location_name ?? ""}
            placeholder="ex. Biserica Sf. Nicolae"
            onChange={(e) => onLocalChange({ location_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Adresă</Label>
          <Input
            value={slot.location_address ?? ""}
            placeholder="ex. Str. Bisericii nr. 12, Cluj-Napoca"
            onChange={(e) => onLocalChange({ location_address: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={slot.serves_alcohol}
              onChange={(e) =>
                onLocalChange({ serves_alcohol: e.target.checked })
              }
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Se servește alcool
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={slot.serves_full_meal}
              onChange={(e) =>
                onLocalChange({ serves_full_meal: e.target.checked })
              }
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Masă completă
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Se salvează…" : "Salvează evenimentul"}
          </Button>
          {saved && <span className="text-sm text-success">Salvat ✓</span>}
        </div>
      </CardContent>
    </Card>
  );
}
