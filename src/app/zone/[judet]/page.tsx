import { Badge } from "@/components/ui/badge";
import { VendorCard } from "@/components/vendors/vendor-card";
import { countyBySlug, slugify, truncate } from "@/lib/localities/geo";
import { listLocalityNames } from "@/lib/localities/query";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { judet: string };
type SP = { tab?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = countyBySlug(judet);
  if (!county) return { title: "Județ inexistent" };

  const title = truncate(`Furnizori de nuntă în ${county.name}`, 59);
  const description = truncate(
    `Furnizori de nuntă verificați în județul ${county.name} și localitățile din județ. Contactare gratuită pentru miri pe NuntaPlanner.`,
    135,
  );
  return pageMeta({
    title,
    description,
    path: `/zone/${judet}`,
    keywords: [`furnizori nuntă ${county.name}`, `nuntă ${county.name}`],
  });
}

export default async function CountyZonePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { judet } = await params;
  const county = countyBySlug(judet);
  if (!county) notFound();

  const { tab } = await searchParams;
  const active = tab === "localitati" ? "localitati" : "furnizori";
  const supabase = await createClient();

  const list =
    active === "furnizori"
      ? ((
          await supabase
            .from("vendors")
            .select(
              "id, business_name, category, regions, description, logo_url, rating",
            )
            .eq("status", "active")
            .eq("verified", true)
            .contains("regions", [county.name])
            .order("rating", { ascending: false })
        ).data ?? [])
      : [];
  const localities =
    active === "localitati"
      ? await listLocalityNames(supabase, county.code)
      : [];

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/zone" className="hover:text-foreground">
          Zone
        </Link>{" "}
        / <span className="text-foreground">{county.name}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Furnizori de nuntă în {county.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Furnizori verificați care acoperă județul {county.name} și lista
          completă a localităților din județ.
        </p>
      </section>

      {/* Tab-uri — linkuri cu ?tab=, fără JS, prietenos SEO. */}
      <div className="flex gap-2 border-b border-border">
        {(
          [
            { key: "furnizori", label: "Furnizori" },
            { key: "localitati", label: "Localități" },
          ] as const
        ).map((t) => (
          <Link
            key={t.key}
            href={`/zone/${judet}?tab=${t.key}`}
            aria-current={active === t.key ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {active === "furnizori" ? (
        list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Niciun furnizor în {county.name} deocamdată.{" "}
            <Link href="/furnizori" className="text-primary hover:underline">
              Vezi toți furnizorii
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )
      ) : (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              Localități în {county.name}
            </h2>
            <Badge tone="muted">{localities.length}</Badge>
          </div>
          {localities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nicio localitate înregistrată pentru acest județ.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {localities.map((name) => (
                <Link
                  key={name}
                  href={`/zone/${judet}/${slugify(name)}`}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {name}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
