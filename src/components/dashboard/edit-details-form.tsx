"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import type { WeddingRow } from "@/lib/supabase/database.types";
import { WEDDING_STYLE_OPTIONS } from "@/lib/wedding/labels";
import { useState } from "react";

const TYPES = [
  { value: "civil", label: "Civilă" },
  { value: "religious", label: "Religioasă" },
  { value: "baptism", label: "Botez" },
];

export function EditDetailsForm({ wedding }: { wedding: WeddingRow }) {
  const [name, setName] = useState(wedding.name);
  const [dateStatus, setDateStatus] = useState(wedding.date_status);
  const [weddingDate, setWeddingDate] = useState(wedding.wedding_date ?? "");
  const [region, setRegion] = useState(wedding.region ?? "");
  const [style, setStyle] = useState(wedding.style ?? "");
  const [types, setTypes] = useState<string[]>(wedding.wedding_type ?? []);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  function toggleType(v: string) {
    setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  }

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      await api.patch(`/weddings/${wedding.id}`, {
        name,
        date_status: dateStatus,
        wedding_date: dateStatus === "set" && weddingDate ? weddingDate : null,
        region: region || null,
        style: style || null,
        wedding_type: types,
      });
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Eroare");
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="name">Numele nunții</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label>Tipul nunții</Label>
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

      {dateStatus === "set" && (
        <div>
          <Label htmlFor="wedding_date">Data exactă</Label>
          <Input
            id="wedding_date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />
        </div>
      )}

      <div>
        <Label htmlFor="region">Regiunea</Label>
        <Input
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
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

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Se salvează…" : "Salvează"}
        </Button>
        {status === "saved" && (
          <span className="text-sm text-success">Salvat ✓</span>
        )}
      </div>
    </div>
  );
}
