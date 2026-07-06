import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { VendorLeadRow, VendorStatus } from "@/lib/supabase/database.types";
import { TIER_PRICING, categoryLabel } from "@/lib/vendors/categories";
import { getActiveSubscription } from "@/lib/vendors/subscription";
import { MAX_VENDOR_IMAGES, MAX_VENDOR_VIDEOS } from "@/lib/vendors/media";
import { Check, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const STATUS: Record<
  VendorStatus,
  { label: string; tone: "success" | "warning" | "muted"; hint: string }
> = {
  pending: {
    label: "În verificare",
    tone: "warning",
    hint: "Profilul tău e în curs de verificare. Vei apărea în director după aprobare.",
  },
  active: {
    label: "Activ",
    tone: "success",
    hint: "Profilul tău e public în directorul de furnizori.",
  },
  suspended: {
    label: "Suspendat",
    tone: "muted",
    hint: "Profilul a fost suspendat. Contactează echipa pentru detalii.",
  },
  inactive: {
    label: "Inactiv",
    tone: "muted",
    hint: "Profilul e inactiv și nu apare în director.",
  },
};

export default async function VendorOverview() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!vendor) redirect("/vendor/onboarding");

  const { data: leadsData } = await supabase.rpc("vendor_leads");
  const leads = (leadsData ?? []) as VendorLeadRow[];
  const count = (s: string) => leads.filter((l) => l.status === s).length;

  const sub = await getActiveSubscription(supabase, vendor.id);
  const { data: mediaData } = await supabase
    .from("vendor_media")
    .select("type")
    .eq("vendor_id", vendor.id);
  const imageCount = (mediaData ?? []).filter((m) => m.type === "image").length;
  const videoCount = (mediaData ?? []).filter((m) => m.type === "video").length;

  const st = STATUS[vendor.status];
  const pricing = TIER_PRICING[vendor.tier];

  // Completitudine profil — ghidează furnizorul spre un profil care atrage cereri.
  const checklist = [
    { label: "Descriere adăugată", done: !!vendor.description?.trim() },
    { label: "Logo încărcat", done: !!vendor.logo_url },
    { label: "Contact (telefon sau email)", done: !!(vendor.phone || vendor.email) },
    { label: "Cel puțin o imagine în galerie", done: imageCount > 0 },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{vendor.business_name}</h1>
          <p className="text-sm text-muted-foreground">
            {categoryLabel(vendor.category)} · {vendor.regions.length} regiuni
          </p>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        {st.hint}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Lead-uri totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Noi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{count("new")}</p>
          </CardContent>
        </Card>
        <Link href="/vendor/mesaje" className="block">
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Mesaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {leads.filter((l) => l.is_unlocked_by_vendor).length}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-primary">
                <MessageSquare className="h-3.5 w-3.5" /> Deschide mesageria
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profilul tău</span>
              <span className="text-sm font-normal text-muted-foreground">
                {doneCount}/{checklist.length} complet
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="space-y-1.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  {c.done ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={c.done ? "" : "text-muted-foreground"}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" asChild className="mt-1">
              <Link href="/vendor/profile">Editează profilul</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Galerie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <b>{imageCount}</b>/{MAX_VENDOR_IMAGES} imagini · <b>{videoCount}</b>
              /{MAX_VENDOR_VIDEOS} videoclipuri
            </p>
            <p className="text-muted-foreground">
              Furnizorii cu galerie primesc mai multe cereri. Adaugă fotografii
              și clipuri cu lucrările tale.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-1">
              <Link href="/vendor/galerie">Gestionează galeria</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model de plată</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Tier <b>{pricing.label}</b> — {pricing.cplRON} RON per lead deblocat
            sau {pricing.monthlyRON} RON/lună abonament.
          </p>
          {sub ? (
            <p className="text-success">
              Ai abonament activ — deblochezi contactele nelimitat, fără costuri
              per lead.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Vezi cererile primite cu contactul mascat și plătești{" "}
              {pricing.cplRON} RON per lead ca să dezvălui contactul mirelui.
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/vendor/leads">Vezi lead-urile</Link>
            </Button>
            <Button variant={sub ? "ghost" : "outline"} size="sm" asChild>
              <Link href="/vendor/subscription">
                {sub ? "Gestionează abonamentul" : "Activează abonamentul"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recomandă și primești o lună gratuită</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Invită alți furnizori pe platformă. Pentru fiecare furnizor adus,
            verificat și activ 30 de zile, primești o lună de abonament gratuită
            (maxim 5 pe lună).
          </p>
          <Button variant="outline" size="sm" asChild className="mt-1">
            <Link href="/vendor/referral">Invită furnizori</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
