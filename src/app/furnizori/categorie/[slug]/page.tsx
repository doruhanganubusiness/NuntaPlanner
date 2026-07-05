import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { VendorCard } from "@/components/vendors/vendor-card";
import { COUNTIES } from "@/lib/localities/counties";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_BY_SLUG,
  TIER_PRICING,
  VENDOR_CATEGORIES_SORTED,
} from "@/lib/vendors/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { slug: string };
type SP = { county?: string };

function truncate(s: string, n: number): string {
  const arr = [...s];
  return arr.length <= n ? s : arr.slice(0, n - 1).join("") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) return { title: "Categorie inexistentă" };

  const title = truncate(`${category.label} de nuntă în România`, 59);
  const description = truncate(
    `Furnizori ${category.label.toLowerCase()} verificați pentru nunta ta. Filtrează pe județ și contactează-i direct, gratuit.`,
    135,
  );
  return pageMeta({
    title,
    description,
    path: `/furnizori/categorie/${slug}`,
    keywords: [
      `${category.label} nuntă`,
      `furnizori ${category.label.toLowerCase()}`,
      "furnizori nuntă",
    ],
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) notFound();

  const { county } = await searchParams;
  const supabase = await createClient();
  let q = supabase
    .from("vendors")
    .select("id, business_name, category, regions, description, logo_url, rating")
    .eq("status", "active")
    .eq("verified", true)
    .eq("category", category.slug)
    .order("rating", { ascending: false });
  if (county) q = q.contains("regions", [county]);
  const { data } = await q;
  const list = data ?? [];
  const pricing = TIER_PRICING[category.tier];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/furnizori" className="hover:text-foreground">
          Furnizori
        </Link>{" "}
        / <span className="text-foreground">{category.label}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.label} de nuntă în România
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Furnizori {category.label.toLowerCase()} verificați de echipa
          NuntaPlanner. Contactarea e gratuită pentru miri — negociezi și
          plătești direct cu furnizorul. Tarif orientativ tier {pricing.label}.
        </p>
      </section>

      {/* Filtru județ — GET form, fără JS, prietenos SEO. */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
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
        {county && (
          <Button variant="ghost" asChild>
            <Link href={`/furnizori/categorie/${category.slug}`}>
              Resetează
            </Link>
          </Button>
        )}
      </form>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Niciun furnizor {category.label.toLowerCase()}
          {county ? ` în ${county}` : ""} deocamdată. Încearcă alt județ sau
          altă categorie.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold">Alte categorii de furnizori</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {VENDOR_CATEGORIES_SORTED.filter((c) => c.slug !== category.slug).map(
            (c) => (
              <Link
                key={c.slug}
                href={`/furnizori/categorie/${c.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {c.label}
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
