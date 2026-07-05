import { VendorCard } from "@/components/vendors/vendor-card";
import { countyBySlug, truncate } from "@/lib/localities/geo";
import { findLocalityName } from "@/lib/localities/query";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_BY_SLUG } from "@/lib/vendors/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

type Params = { categorie: string; judet: string; localitate: string };

// O singură rezolvare a localității pentru metadata + pagină (React cache).
const resolveLocality = cache(
  async (countyCode: string, localitySlug: string) => {
    const supabase = await createClient();
    return findLocalityName(supabase, countyCode, localitySlug);
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { categorie, judet, localitate } = await params;
  const category = CATEGORY_BY_SLUG.get(categorie);
  const county = countyBySlug(judet);
  if (!category || !county) return { title: "Pagină inexistentă" };
  const locality = await resolveLocality(county.code, localitate);
  if (!locality) return { title: "Localitate inexistentă" };

  const title = truncate(`${category.label} de nuntă în ${locality}`, 59);
  const description = truncate(
    `Furnizori ${category.label.toLowerCase()} pentru nuntă în ${locality}, județul ${county.name}. Contactează-i direct, gratuit pe NuntaPlanner.`,
    135,
  );
  return pageMeta({
    title,
    description,
    path: `/furnizori/categorie/${categorie}/${judet}/${localitate}`,
    keywords: [
      `${category.label} ${locality}`,
      `${category.label.toLowerCase()} nuntă ${locality}`,
    ],
  });
}

export default async function CategoryLocalityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { categorie, judet, localitate } = await params;
  const category = CATEGORY_BY_SLUG.get(categorie);
  const county = countyBySlug(judet);
  if (!category || !county) notFound();
  const locality = await resolveLocality(county.code, localitate);
  if (!locality) notFound();

  const supabase = await createClient();
  // Furnizorii sunt la nivel de județ (regions = nume județ), deci afișăm cei
  // care acoperă județul localității — cea mai fină granularitate disponibilă.
  const { data } = await supabase
    .from("vendors")
    .select("id, business_name, category, regions, description, logo_url, rating")
    .eq("status", "active")
    .eq("verified", true)
    .eq("category", category.slug)
    .contains("regions", [county.name])
    .order("rating", { ascending: false });
  const list = data ?? [];

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
        /{" "}
        <Link
          href={`/furnizori/categorie/${category.slug}/${judet}`}
          className="hover:text-foreground"
        >
          {county.name}
        </Link>{" "}
        / <span className="text-foreground">{locality}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.label} de nuntă în {locality}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Furnizori {category.label.toLowerCase()} disponibili în {locality} și
          în restul județului {county.name}. Contactarea e gratuită pentru miri
          — negociezi și plătești direct cu furnizorul.
        </p>
      </section>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Niciun furnizor {category.label.toLowerCase()} în zona {locality}{" "}
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

      <p className="text-sm">
        <Link
          href={`/furnizori/categorie/${category.slug}/${judet}`}
          className="text-primary hover:underline"
        >
          ← Toți furnizorii {category.label.toLowerCase()} din {county.name}
        </Link>
      </p>
    </div>
  );
}
