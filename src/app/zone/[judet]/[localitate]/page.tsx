import { VendorCard } from "@/components/vendors/vendor-card";
import { countyBySlug, truncate } from "@/lib/localities/geo";
import { findLocalityName } from "@/lib/localities/query";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { VENDOR_CATEGORIES_SORTED } from "@/lib/vendors/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

type Params = { judet: string; localitate: string };

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
  const { judet, localitate } = await params;
  const county = countyBySlug(judet);
  if (!county) return { title: "Județ inexistent" };
  const locality = await resolveLocality(county.code, localitate);
  if (!locality) return { title: "Localitate inexistentă" };

  const title = truncate(`Furnizori de nuntă în ${locality}`, 59);
  const description = truncate(
    `Furnizori de nuntă verificați în ${locality}, județul ${county.name}. Contactare gratuită pentru miri, direct pe NuntaPlanner.`,
    135,
  );
  return pageMeta({
    title,
    description,
    path: `/zone/${judet}/${localitate}`,
    keywords: [`furnizori nuntă ${locality}`, `nuntă ${locality}`],
  });
}

export default async function LocalityZonePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { judet, localitate } = await params;
  const county = countyBySlug(judet);
  if (!county) notFound();
  const locality = await resolveLocality(county.code, localitate);
  if (!locality) notFound();

  const supabase = await createClient();
  // Furnizorii sunt la nivel de județ (regions = nume județ) → afișăm cei care
  // acoperă județul localității.
  const { data } = await supabase
    .from("vendors")
    .select("id, business_name, category, regions, description, logo_url, rating")
    .eq("status", "active")
    .eq("verified", true)
    .contains("regions", [county.name])
    .order("rating", { ascending: false });
  const list = data ?? [];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/zone" className="hover:text-foreground">
          Zone
        </Link>{" "}
        /{" "}
        <Link href={`/zone/${judet}`} className="hover:text-foreground">
          {county.name}
        </Link>{" "}
        / <span className="text-foreground">{locality}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Furnizori de nuntă în {locality}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Toți furnizorii verificați disponibili în {locality} și în restul
          județului {county.name}. Contactarea e gratuită pentru miri.
        </p>
      </section>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Niciun furnizor în zona {locality} deocamdată.{" "}
          <Link
            href={`/zone/${judet}`}
            className="text-primary hover:underline"
          >
            Vezi tot județul {county.name}
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

      {/* Cross-link pe categorie în această localitate (SEO local). */}
      <section>
        <h2 className="text-lg font-semibold">Caută pe categorie în {locality}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {VENDOR_CATEGORIES_SORTED.map((c) => (
            <Link
              key={c.slug}
              href={`/furnizori/categorie/${c.slug}/${judet}/${localitate}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
