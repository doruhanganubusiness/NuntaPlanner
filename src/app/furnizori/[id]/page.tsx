import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { TIER_PRICING, categoryLabel } from "@/lib/vendors/categories";
import { Globe, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const v = await getVendor(id);
  if (!v) return { title: "Furnizor inexistent" };

  const title = truncate(`${v.business_name} — ${categoryLabel(v.category)}`, 59);
  const description = truncate(
    v.description?.trim() ||
      `${categoryLabel(v.category)} pentru nunta ta. Contactează ${v.business_name} gratuit pe NuntaPlanner.`,
    135,
  );
  return pageMeta({ title, description, path: `/furnizori/${id}` });
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = await getVendor(id);
  if (!v) notFound();

  const supabase = await createClient();
  const { data: mediaData } = await supabase
    .from("vendor_media")
    .select("id, type, url")
    .eq("vendor_id", v.id)
    .order("position");
  const media = mediaData ?? [];
  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

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
            href={`/furnizori/categorie/${v.category}`}
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

      {images.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Galerie foto</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={m.id}
                src={m.url}
                alt={`${v.business_name} — fotografie`}
                className="aspect-square w-full rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Video</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {videos.map((m) => (
              <video
                key={m.id}
                src={m.url}
                controls
                className="w-full rounded-lg border border-border"
              />
            ))}
          </div>
        </section>
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
