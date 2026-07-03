"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { COUNTIES, COUNTY_BY_CODE } from "@/lib/localities/counties";
import { useEffect, useState } from "react";

export type LocalityValue = {
  county_code: string | null;
  county: string | null;
  locality: string | null;
};

const CUSTOM = "__custom__";

/**
 * Selector în cascadă: județ → localitate (filtrată după județ), cu opțiunea de a
 * adăuga o localitate care nu e în listă (ex. un sat mic).
 */
export function LocalityPicker({
  value,
  onChange,
}: {
  value: LocalityValue;
  onChange: (v: LocalityValue) => void;
}) {
  const [localities, setLocalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);

  // Încarcă localitățile când se schimbă județul.
  useEffect(() => {
    const code = value.county_code;
    if (!code) {
      setLocalities([]);
      return;
    }
    let active = true;
    setLoading(true);
    createClient()
      .from("localities")
      .select("name")
      .eq("county_code", code)
      .order("name")
      .then(({ data }) => {
        if (!active) return;
        const names = (data ?? []).map((r) => r.name as string);
        setLocalities(names);
        // Dacă localitatea salvată nu e în listă, trecem pe modul custom.
        if (value.locality && !names.includes(value.locality)) setCustom(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.county_code]);

  function selectCounty(code: string) {
    const county = COUNTY_BY_CODE.get(code)?.name ?? null;
    setCustom(false);
    onChange({ county_code: code || null, county, locality: null });
  }

  function selectLocality(v: string) {
    if (v === CUSTOM) {
      setCustom(true);
      onChange({ ...value, locality: "" });
    } else {
      setCustom(false);
      onChange({ ...value, locality: v || null });
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor="county">Județ</Label>
        <Select
          id="county"
          value={value.county_code ?? ""}
          onChange={(e) => selectCounty(e.target.value)}
        >
          <option value="">Alege județul…</option>
          {COUNTIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="locality">Localitate</Label>
        {custom ? (
          <div className="space-y-1">
            <Input
              id="locality"
              placeholder="Scrie localitatea"
              value={value.locality ?? ""}
              onChange={(e) =>
                onChange({ ...value, locality: e.target.value || null })
              }
            />
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => {
                setCustom(false);
                onChange({ ...value, locality: null });
              }}
            >
              ← alege din listă
            </button>
          </div>
        ) : (
          <Select
            id="locality"
            value={value.locality ?? ""}
            disabled={!value.county_code || loading}
            onChange={(e) => selectLocality(e.target.value)}
          >
            <option value="">
              {loading ? "Se încarcă…" : "Alege localitatea…"}
            </option>
            {localities.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            <option value={CUSTOM}>➕ Altă localitate (o adaug eu)</option>
          </Select>
        )}
      </div>
    </div>
  );
}
