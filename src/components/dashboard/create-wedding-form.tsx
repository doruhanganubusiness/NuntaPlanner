"use client";

import {
  LocalityPicker,
  type LocalityValue,
} from "@/components/dashboard/locality-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import type { WeddingRow } from "@/lib/supabase/database.types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateWeddingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [place, setPlace] = useState<LocalityValue>({
    county_code: null,
    county: null,
    locality: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { wedding } = await api.post<{ wedding: WeddingRow }>("/weddings", {
        name,
        region: place.county ?? undefined,
      });
      // Salvează județul/localitatea aleasă pe nunta nou creată.
      if (place.county_code) {
        await api.patch(`/weddings/${wedding.id}`, {
          county_code: place.county_code,
          county: place.county,
          locality: place.locality,
          region: place.county,
        });
      }
      router.push(`/dashboard/${wedding.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        <Label>Locația nunții</Label>
        <LocalityPicker value={place} onChange={setPlace} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Se creează…" : "Creează nunta"}
      </Button>
    </form>
  );
}
