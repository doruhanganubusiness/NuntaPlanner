"use client";

import { Combobox, type ComboOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { COUNTIES, COUNTY_BY_CODE } from "@/lib/localities/counties";
import { useEffect, useState } from "react";

export type LocalityValue = {
  county_code: string | null;
  county: string | null;
  locality: string | null;
};

const CUSTOM = "__custom__";

// Județele ordonate alfabetic (colație românească) — București iese între
// Brăila și Buzău, nu la final.
const COUNTY_OPTIONS: ComboOption[] = [...COUNTIES]
  .sort((a, b) => a.name.localeCompare(b.name, "ro"))
  .map((c) => ({ value: c.code, label: c.name }));

/**
 * Selector în cascadă: județ → localitate (filtrată după județ), ambele cu
 * casetă de căutare (Combobox). Permite și o localitate scrisă manual.
 */
export function LocalityPicker({
  value,
  onChange,
  idPrefix = "",
}: {
  value: LocalityValue;
  onChange: (v: LocalityValue) => void;
  idPrefix?: string;
}) {
  const [localities, setLocalities] = useState<string[]>([]);
  const [loadedCode, setLoadedCode] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);

  const loading = !!value.county_code && loadedCode !== value.county_code;

  useEffect(() => {
    const code = value.county_code;
    if (!code) return;
    let active = true;
    createClient()
      .from("localities")
      .select("name")
      .eq("county_code", code)
      .order("name")
      .then(({ data }) => {
        if (!active) return;
        const names = (data ?? []).map((r) => r.name as string);
        setLocalities(names);
        setLoadedCode(code);
        if (value.locality && !names.includes(value.locality)) setCustom(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.county_code]);

  function selectCounty(code: string) {
    const county = COUNTY_BY_CODE.get(code)?.name ?? null;
    setCustom(false);
    if (!code) {
      setLocalities([]);
      setLoadedCode(null);
    }
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

  const localityOptions: ComboOption[] = [
    ...localities.map((n) => ({ value: n, label: n })),
    { value: CUSTOM, label: "➕ Altă localitate (o adaug eu)" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${idPrefix}county`}>Județ</Label>
        <Combobox
          id={`${idPrefix}county`}
          value={value.county_code ?? ""}
          onChange={selectCounty}
          options={COUNTY_OPTIONS}
          placeholder="Alege județul…"
          searchPlaceholder="Caută județ…"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}locality`}>Localitate</Label>
        {custom ? (
          <div className="space-y-1">
            <Input
              id={`${idPrefix}locality`}
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
          <Combobox
            id={`${idPrefix}locality`}
            value={value.locality ?? ""}
            onChange={selectLocality}
            options={localityOptions}
            disabled={!value.county_code || loading}
            placeholder={loading ? "Se încarcă…" : "Alege localitatea…"}
            searchPlaceholder="Caută localitate…"
          />
        )}
      </div>
    </div>
  );
}
