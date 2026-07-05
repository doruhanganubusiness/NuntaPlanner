import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { VendorCard } from "@/components/vendors/vendor-card";
import { COUNTIES } from "@/lib/localities/counties";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { VENDOR_CATEGORIES_SORTED } from "@/lib/vendors/categories";
import type { Metadata } from "next";
import Link from "next/link";

const TITLE = "Furnizori de nuntă verificați în România";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Găsește furnizori de nuntă verificați: fotografi, formații, restaurante și mai mult. Filtrează pe categorie și județ.",
  path: "/furnizori",
  keywords: [
    "furnizori nuntă",
    "fotograf nuntă",
    "formație nuntă",
    "restaurant nuntă",
    "director furnizori nuntă",
  ],
});

export default async function FurnizoriPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; county?: string }>;
}) {
  const { category, county } = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("vendors")
    .select("id, business_name, category, regions, description, logo_url, rating")
    .eq("status", "active")
    .eq("verified", true)
    .order("rating", { ascending: false });
  if (category) q = q.eq("category", category);
  if (county) q = q.contains("regions", [county]);
  const { data: vendors } = await q;
  const list = vendors ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Furnizori verificați de echipa NuntaPlanner. Contactarea e gratuită
          pentru miri — negociezi și plătești direct cu furnizorul.
        </p>
      </section>

      {/* Categorii — pagini dedicate per categorie (linkuri interne, SEO). */}
      <section>
        <h2 className="text-lg font-semibold">Explorează pe categorie</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {VENDOR_CATEGORIES_SORTED.map((c) => (
            <Link
              key={c.slug}
              href={`/furnizori/categorie/${c.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Filtre — GET form, fără JS, prietenos SEO. */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div className="min-w-48">
          <label className="mb-1 block text-sm font-medium">Categorie</label>
          <Select name="category" defaultValue={category ?? ""}>
            <option value="">Toate categoriile</option>
            {VENDOR_CATEGORIES_SORTED.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-48">
          <label className="mb-1 block text-sm font-medium">Județ</label>
          <Select name="county" defaultValue={county ?? ""}>
            <option value="">Toate județele</option>
            {COUNTIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Filtrează</Button>
        {(category || county) && (
          <Button variant="ghost" asChild>
            <Link href="/furnizori">Resetează</Link>
          </Button>
        )}
      </form>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Niciun furnizor pentru filtrele alese. Încearcă altă categorie sau
          județ.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </div>
  );
}
