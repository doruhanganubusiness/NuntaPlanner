import { VendorCard } from "@/components/vendors/vendor-card";
import { countyBySlug, slugify, truncate } from "@/lib/localities/geo";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_BY_SLUG, TIER_PRICING } from "@/lib/vendors/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { categorie: string; judet: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { categorie, judet } = await params;
  const category = CATEGORY_BY_SLUG.get(categorie);
  const county = countyBySlug(judet);
  if (!category || !county) return { title: "Pagină inexistentă" };

  const title = truncate(`${category.label} de nuntă în ${county.name}`, 59);
  const description = truncate(
    `Furnizori ${category.label.toLowerCase()} pentru nuntă în județul ${county.name}. Vezi profiluri verificate și contactează-i direct, gratuit.`,
    135,
  );
  return pageMeta({
    title,
    description,
    path: `/furnizori/categorie/${categorie}/${judet}`,
    keywords: [
      `${category.label} ${county.name}`,
      `${category.label.toLowerCase()} nuntă ${county.name}`,
    ],
  });
}

export default async function CategoryCountyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { categorie, judet } = await params;
  const category = CATEGORY_BY_SLUG.get(categorie);
  const county = countyBySlug(judet);
  if (!category || !county) notFound();

  const supabase = await createClient();
  const [{ data: vendorsData }, { data: localitiesData }] = await Promise.all([
    supabase
      .from("vendors")
      .select(
        "id, business_name, category, regions, description, logo_url, rating",
      )
      .eq("status", "active")
      .eq("verified", true)
      .eq("category", category.slug)
      .contains("regions", [county.name])
      .order("rating", { ascending: false }),
    supabase
      .from("localities")
      .select("name")
      .eq("county_code", county.code)
      .order("name"),
  ]);
  const list = vendorsData ?? [];
  const localities = localitiesData ?? [];
  const pricing = TIER_PRICING[category.tier];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/furnizori" className="hover:text-foreground">
          Furnizori
        </Link>{" "}
        /{" "}
        <Link
          href={`/furnizori/categorie/${category.slug}`}
          className="hover:text-foreground"
        >
          {category.label}
        </Link>{" "}
        / <span className="text-foreground">{county.name}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.label} de nuntă în {county.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Furnizori {category.label.toLowerCase()} care acoperă județul{" "}
          {county.name}, verificați de echipa NuntaPlanner. Contactarea e
          gratuită pentru miri. Tarif orientativ tier {pricing.label}.
        </p>
      </section>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Niciun furnizor {category.label.toLowerCase()} în {county.name}{" "}
          deocamdată.{" "}
          <Link
            href={`/furnizori/categorie/${category.slug}`}
            className="text-primary hover:underline"
          >
            Vezi în toată țara
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}

      {localities.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">
            {category.label} pe localitate în {county.name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {localities.map((l) => (
              <Link
                key={l.name}
                href={`/furnizori/categorie/${category.slug}/${judet}/${slugify(l.name)}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {l.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
