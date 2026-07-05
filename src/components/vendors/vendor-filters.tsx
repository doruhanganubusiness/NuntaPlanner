"use client";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboOption } from "@/components/ui/combobox";
import { COUNTIES } from "@/lib/localities/counties";
import { VENDOR_CATEGORIES_SORTED } from "@/lib/vendors/categories";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COUNTY_OPTIONS: ComboOption[] = [
  { value: "", label: "Toate județele" },
  ...[...COUNTIES]
    .sort((a, b) => a.name.localeCompare(b.name, "ro"))
    .map((c) => ({ value: c.name, label: c.name })),
];

const CATEGORY_OPTIONS: ComboOption[] = [
  { value: "", label: "Toate categoriile" },
  ...VENDOR_CATEGORIES_SORTED.map((c) => ({ value: c.slug, label: c.label })),
];

/**
 * Filtre pentru directorul de furnizori: categorie + județ, ambele cu casetă de
 * căutare. Navighează prin query params (înlocuiește vechiul GET form, ca listele
 * lungi de județe/categorii să fie căutabile).
 */
export function VendorFilters({
  basePath,
  category,
  county,
  showCategory = true,
}: {
  basePath: string;
  category?: string;
  county?: string;
  showCategory?: boolean;
}) {
  const router = useRouter();
  const [cat, setCat] = useState(category ?? "");
  const [cty, setCty] = useState(county ?? "");

  function apply() {
    const p = new URLSearchParams();
    if (showCategory && cat) p.set("category", cat);
    if (cty) p.set("county", cty);
    const qs = p.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function reset() {
    setCat("");
    setCty("");
    router.push(basePath);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      {showCategory && (
        <div className="min-w-52">
          <label className="mb-1 block text-sm font-medium">Categorie</label>
          <Combobox
            value={cat}
            onChange={setCat}
            options={CATEGORY_OPTIONS}
            placeholder="Toate categoriile"
            searchPlaceholder="Caută categorie…"
          />
        </div>
      )}
      <div className="min-w-52">
        <label className="mb-1 block text-sm font-medium">Județ</label>
        <Combobox
          value={cty}
          onChange={setCty}
          options={COUNTY_OPTIONS}
          placeholder="Toate județele"
          searchPlaceholder="Caută județ…"
        />
      </div>
      <Button onClick={apply}>Filtrează</Button>
      {(cat || cty) && (
        <Button variant="ghost" onClick={reset}>
          Resetează
        </Button>
      )}
    </div>
  );
}
