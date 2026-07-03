"use client";

import {
  LocalityPicker,
  type LocalityValue,
} from "@/components/dashboard/locality-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { BUDGET_LABELS, type BudgetCategoryKey } from "@/lib/engine";
import type { SlotTypeDb, WeddingRow } from "@/lib/supabase/database.types";
import {
  SLOT_TYPE_OPTIONS,
  WEDDING_STYLE_OPTIONS,
  slotDefaults,
} from "@/lib/wedding/labels";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPES = [
  { value: "civil", label: "Cununie civilă" },
  { value: "religious", label: "Cununie religioasă" },
  { value: "baptism", label: "Botez" },
];

const ALL_CATEGORIES: BudgetCategoryKey[] = [
  "venue_catering",
  "photo_video",
  "music",
  "decor_flowers",
  "attire",
  "drinks",
  "invitations_favors_cake",
  "misc",
];

type SlotDraft = {
  key: string;
  slot_type: SlotTypeDb;
  title: string;
  guests_adults: number;
  guests_children: number;
  duration_hours: number | null;
  location_name: string;
  serves_alcohol: boolean;
  serves_full_meal: boolean;
};

let counter = 0;
function newSlot(type: SlotTypeDb): SlotDraft {
  const d = slotDefaults(type);
  return {
    key: `s${counter++}`,
    slot_type: type,
    title: d.title,
    guests_adults: 0,
    guests_children: 0,
    duration_hours: d.duration_minutes != null ? d.duration_minutes / 60 : null,
    location_name: "",
    serves_alcohol: d.serves_alcohol,
    serves_full_meal: d.serves_full_meal,
  };
}

export function OnboardingForm() {
  const router = useRouter();

  // Detalii eveniment
  const [name, setName] = useState("");
  const [types, setTypes] = useState<string[]>(["civil", "religious"]);
  const [dateStatus, setDateStatus] =
    useState<WeddingRow["date_status"]>("undecided");
  const [weddingDate, setWeddingDate] = useState("");
  const [place, setPlace] = useState<LocalityValue>({
    county_code: null,
    county: null,
    locality: null,
  });
  const [style, setStyle] = useState("");

  // Sloturi
  const [slots, setSlots] = useState<SlotDraft[]>([newSlot("reception")]);

  // Buget
  const [total, setTotal] = useState("");
  const [drinkMode, setDrinkMode] =
    useState<WeddingRow["drink_mode"]>("quantities");
  const [priorities, setPriorities] =
    useState<BudgetCategoryKey[]>(ALL_CATEGORIES);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleType(v: string) {
    setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }
  function patchSlot(key: string, patch: Partial<SlotDraft>) {
    setSlots((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }
  function changeSlotType(key: string, type: SlotTypeDb) {
    const d = slotDefaults(type);
    patchSlot(key, {
      slot_type: type,
      title: d.title,
      serves_alcohol: d.serves_alcohol,
      serves_full_meal: d.serves_full_meal,
      duration_hours: d.duration_minutes != null ? d.duration_minutes / 60 : null,
    });
  }
  function movePriority(idx: number, dir: -1 | 1) {
    const next = [...priorities];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setPriorities(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { wedding } = await api.post<{ wedding: WeddingRow }>("/weddings", {
        name,
        region: place.county ?? undefined,
      });
      await api.patch(`/weddings/${wedding.id}`, {
        wedding_type: types,
        date_status: dateStatus,
        wedding_date:
          dateStatus !== "undecided" && weddingDate ? weddingDate : null,
        county_code: place.county_code,
        county: place.county,
        locality: place.locality,
        region: place.county,
        style: style || null,
        total_budget: total ? Number(total) : null,
        drink_mode: drinkMode,
        budget_priorities: priorities,
      });
      let order = 0;
      for (const s of slots) {
        await api.post(`/weddings/${wedding.id}/slots`, {
          slot_type: s.slot_type,
          title: s.title,
          guests_adults: s.guests_adults,
          guests_children: s.guests_children,
          duration_minutes:
            s.duration_hours != null ? Math.round(s.duration_hours * 60) : null,
          location_name: s.location_name || null,
          serves_alcohol: s.serves_alcohol,
          serves_full_meal: s.serves_full_meal,
          order_index: order++,
        });
      }
      router.push(`/dashboard/${wedding.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* 1. Despre eveniment */}
      <Card>
        <CardHeader>
          <CardTitle>1. Despre eveniment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Numele nunții</Label>
            <Input
              id="name"
              required
              placeholder="Nunta Ana & Andrei"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Nunta include</Label>
            <div className="flex flex-wrap gap-3">
              {TYPES.map((t) => (
                <label key={t.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={types.includes(t.value)}
                    onChange={() => toggleType(t.value)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date_status">Data</Label>
              <Select
                id="date_status"
                value={dateStatus}
                onChange={(e) =>
                  setDateStatus(e.target.value as WeddingRow["date_status"])
                }
              >
                <option value="undecided">Nedecisă</option>
                <option value="estimated">Estimată</option>
                <option value="set">Fixată</option>
              </Select>
            </div>
            {dateStatus !== "undecided" && (
              <div>
                <Label htmlFor="wedding_date">
                  {dateStatus === "estimated" ? "Data estimată" : "Data exactă"}
                </Label>
                <Input
                  id="wedding_date"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                />
              </div>
            )}
          </div>
          <div>
            <Label>Locația nunții</Label>
            <LocalityPicker value={place} onChange={setPlace} />
          </div>
          <div>
            <Label htmlFor="style">Stil</Label>
            <Select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="">Nespecificat</option>
              {WEDDING_STYLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Sloturile zilei */}
      <Card>
        <CardHeader>
          <CardTitle>2. Programul zilei</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {slots.map((s) => (
            <div key={s.key} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Tip</Label>
                    <Select
                      value={s.slot_type}
                      onChange={(e) =>
                        changeSlotType(s.key, e.target.value as SlotTypeDb)
                      }
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
                      value={s.title}
                      onChange={(e) =>
                        patchSlot(s.key, { title: e.target.value })
                      }
                    />
                  </div>
                </div>
                {slots.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSlots((x) => x.filter((y) => y.key !== s.key))
                    }
                    aria-label="Șterge slot"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Adulți</Label>
                  <Input
                    type="number"
                    min={0}
                    value={s.guests_adults}
                    onChange={(e) =>
                      patchSlot(s.key, { guests_adults: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Copii</Label>
                  <Input
                    type="number"
                    min={0}
                    value={s.guests_children}
                    onChange={(e) =>
                      patchSlot(s.key, {
                        guests_children: Number(e.target.value),
                      })
                    }
                  />
                </div>
                {s.slot_type === "reception" && (
                  <div>
                    <Label>Durată (ore)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={s.duration_hours ?? ""}
                      onChange={(e) =>
                        patchSlot(s.key, {
                          duration_hours: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="mt-3">
                <Label>Locație</Label>
                <Input
                  value={s.location_name}
                  placeholder="ex. Biserica Sf. Nicolae"
                  onChange={(e) =>
                    patchSlot(s.key, { location_name: e.target.value })
                  }
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.serves_alcohol}
                    onChange={(e) =>
                      patchSlot(s.key, { serves_alcohol: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Se servește alcool
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.serves_full_meal}
                    onChange={(e) =>
                      patchSlot(s.key, { serves_full_meal: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Masă completă
                </label>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setSlots((s) => [...s, newSlot("civil_ceremony")])}
          >
            + Adaugă slot
          </Button>
        </CardContent>
      </Card>

      {/* 3. Buget */}
      <Card>
        <CardHeader>
          <CardTitle>3. Buget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="total">Bugetul tău (RON) — opțional</Label>
              <Input
                id="total"
                type="number"
                min={0}
                placeholder="îl recomandăm noi dacă îl lași gol"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="drink_mode">Băutură</Label>
              <Select
                id="drink_mode"
                value={drinkMode}
                onChange={(e) =>
                  setDrinkMode(e.target.value as WeddingRow["drink_mode"])
                }
              >
                <option value="quantities">
                  Calculează cantități (mirii aduc)
                </option>
                <option value="cost">Calculează cost (inclusă în meniu)</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Prioritizează categoriile</Label>
            <ul className="divide-y divide-border rounded-md border border-border">
              {priorities.map((key, idx) => (
                <li
                  key={key}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span>
                    {idx + 1}. {BUDGET_LABELS[key]}
                  </span>
                  <span className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => movePriority(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Mai sus"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => movePriority(idx, 1)}
                      disabled={idx === priorities.length - 1}
                      aria-label="Mai jos"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Se creează…" : "Creează nunta și vezi planul"}
        </Button>
      </div>
    </form>
  );
}
