import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VendorBrowse,
  type BrowseVendor,
} from "@/components/dashboard/vendor-browse";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/supabase/database.types";
import { categoryLabel } from "@/lib/vendors/categories";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Trimisă",
  unlocked: "Deblocată",
  contacted: "Contactat",
  converted: "Convertit",
  lost: "Pierdut",
};

type SentLead = {
  id: string;
  status: LeadStatus;
  vendor_id: string;
  created_at: string;
  vendors: { business_name: string; category: string } | null;
};

export default async function VendorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("county, region")
    .eq("id", id)
    .maybeSingle();
  const region = wedding?.county ?? wedding?.region ?? null;

  let vq = supabase
    .from("vendors")
    .select("id, business_name, category, regions, description, logo_url, rating")
    .eq("status", "active")
    .eq("verified", true)
    .order("rating", { ascending: false });
  if (region) vq = vq.contains("regions", [region]);
  const { data: vendors } = await vq;

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, status, vendor_id, created_at, vendors(business_name, category)")
    .eq("wedding_id", id)
    .order("created_at", { ascending: false });
  const sentLeads = (leadsData ?? []) as unknown as SentLead[];
  const contactedIds = sentLeads.map((l) => l.vendor_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Furnizori recomandați</h2>
        <p className="text-sm text-muted-foreground">
          {region
            ? `Furnizori activi din regiunea ${region}. Contactează-i direct — e gratuit pentru tine.`
            : "Adaugă regiunea nunții în Detalii ca să vezi furnizori potriviți."}
        </p>
      </div>

      {sentLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cererile tale</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {sentLeads.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>
                    {l.vendors?.business_name ?? "Furnizor"}
                    <span className="text-muted-foreground">
                      {l.vendors ? ` · ${categoryLabel(l.vendors.category)}` : ""}
                    </span>
                  </span>
                  <Badge tone={l.status === "converted" ? "success" : "muted"}>
                    {STATUS_LABEL[l.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <VendorBrowse
        weddingId={id}
        vendors={(vendors ?? []) as BrowseVendor[]}
        contactedIds={contactedIds}
      />
    </div>
  );
}
