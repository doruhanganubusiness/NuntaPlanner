import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { COUNTIES } from "@/lib/localities/counties";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import {
  VENDOR_CATEGORIES_SORTED,
  categoryLabel,
} from "@/lib/vendors/categories";
import { Star } from "lucide-react";
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
            <Link
              key={v.id}
              href={`/furnizori/${v.id}`}
              className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                {v.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.logo_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.business_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel(v.category)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-warning" />
                    {v.rating.toFixed(1)}
                  </p>
                </div>
              </div>
              {v.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {v.description}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {v.regions.slice(0, 3).join(", ")}
                {v.regions.length > 3 ? "…" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
