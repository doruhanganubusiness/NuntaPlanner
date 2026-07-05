import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { VendorCard } from "@/components/vendors/vendor-card";
import { COUNTIES } from "@/lib/localities/counties";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_BY_SLUG,
  TIER_PRICING,
  VENDOR_CATEGORIES_SORTED,
  categoryLabel,
  type VendorCategory,
} from "@/lib/vendors/categories";
import { Globe, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

type Params = { slug: string };
type SP = { county?: string };

// Aceeași citire pentru metadata și pagină — o singură interogare (React cache).
const getVendor = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
});

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

  // 1) Slug de categorie → pagina de categorie.
  const category = CATEGORY_BY_SLUG.get(slug);
  if (category) {
    const title = truncate(`${category.label} de nuntă în România`, 59);
    const description = truncate(
      `Furnizori ${category.label.toLowerCase()} verificați pentru nunta ta. Filtrează pe județ și contactează-i direct, gratuit.`,
      135,
    );
    return pageMeta({
      title,
      description,
      path: `/furnizori/${slug}`,
      keywords: [
        `${category.label} nuntă`,
        `furnizori ${category.label.toLowerCase()}`,
        "furnizori nuntă",
      ],
    });
  }

  // 2) Altfel → detaliu furnizor (slug = id).
  const v = await getVendor(slug);
  if (!v) return { title: "Furnizor inexistent" };
  const title = truncate(`${v.business_name} — ${categoryLabel(v.category)}`, 59);
  const description = truncate(
    v.description?.trim() ||
      `${categoryLabel(v.category)} pentru nunta ta. Contactează ${v.business_name} gratuit pe NuntaPlanner.`,
    135,
  );
  return pageMeta({ title, description, path: `/furnizori/${slug}` });
}

export default async function FurnizoriSlugPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;

  const category = CATEGORY_BY_SLUG.get(slug);
  if (category) {
    const { county } = await searchParams;
    return <CategoryView category={category} county={county} />;
  }

  const v = await getVendor(slug);
  if (!v) notFound();
  return <VendorDetail vendor={v} />;
}

// ------------------------------------------------------------------
// Pagina unei categorii de furnizori.
// ------------------------------------------------------------------
async function CategoryView({
  category,
  county,
}: {
  category: VendorCategory;
  county?: string;
}) {
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
            <Link href={`/furnizori/${category.slug}`}>Resetează</Link>
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
                href={`/furnizori/${c.slug}`}
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

// ------------------------------------------------------------------
// Detaliul unui furnizor (slug = id).
// ------------------------------------------------------------------
function VendorDetail({
  vendor: v,
}: {
  vendor: NonNullable<Awaited<ReturnType<typeof getVendor>>>;
}) {
  const pricing = TIER_PRICING[v.tier];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/furnizori"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Toți furnizorii
      </Link>

      <div className="flex items-start gap-4">
        {v.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.logo_url}
            alt={v.business_name}
            className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{v.business_name}</h1>
          <Link
            href={`/furnizori/${v.category}`}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            {categoryLabel(v.category)}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-current text-warning" />
              {v.rating.toFixed(1)}
            </span>
            <Badge tone="muted">{pricing.label}</Badge>
          </div>
        </div>
      </div>

      {v.description && (
        <Card>
          <CardContent className="whitespace-pre-line pt-6 text-sm">
            {v.description}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium">Regiuni acoperite</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {v.regions.join(", ") || "—"}
            </p>
          </CardContent>
        </Card>
        {v.website && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium">Website</p>
              <a
                href={v.website}
                target="_blank"
                rel="noreferrer nofollow"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" /> {v.website}
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <p className="font-medium">Vrei să-l contactezi?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Intră în contul tău de miri, deschide-ți nunta și trimite o cerere
            din tab-ul „Furnizori”. E gratuit — negociezi direct cu furnizorul.
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/dashboard">Contactează din contul tău</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register?type=client">Creează cont</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
