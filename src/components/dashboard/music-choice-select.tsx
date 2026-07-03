"use client";

import { Select } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import type { MusicRecommendation } from "@/lib/engine";
import { musicLabel } from "@/lib/wedding/labels";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Permite mirilor să suprascrie recomandarea de muzică (DJ / Formație / Formație + DJ).
 * La schimbare, salvează alegerea și recalculează bugetul.
 */
export function MusicChoiceSelect({
  weddingId,
  current,
  recommendation,
}: {
  weddingId: string;
  current: MusicRecommendation | null;
  recommendation: MusicRecommendation;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function change(v: string) {
    setSaving(true);
    await api.patch(`/weddings/${weddingId}`, {
      music_choice: v === "" ? null : v,
    });
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="mt-3">
      <label className="mb-1 block text-xs text-muted-foreground">
        Vrei altceva? Alege tu:
      </label>
      <Select
        value={current ?? ""}
        disabled={saving}
        onChange={(e) => change(e.target.value)}
      >
        <option value="">
          Recomandarea noastră ({musicLabel(recommendation)})
        </option>
        <option value="dj">DJ</option>
        <option value="band">Formație</option>
        <option value="band_and_dj">Formație + DJ</option>
      </Select>
    </div>
  );
}
