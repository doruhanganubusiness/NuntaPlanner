import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CoupleConversations,
  type CoupleLead,
} from "@/components/dashboard/couple-conversations";
import {
  VendorBrowse,
  type BrowseVendor,
} from "@/components/dashboard/vendor-browse";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/supabase/database.types";

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
            <p className="mb-3 text-sm text-muted-foreground">
              Scrie-le direct furnizorilor. Ei îți văd mesajele după ce îți
              deblochează cererea.
            </p>
            <CoupleConversations
              leads={sentLeads.map(
                (l): CoupleLead => ({
                  id: l.id,
                  status: l.status,
                  vendorName: l.vendors?.business_name ?? "Furnizor",
                  vendorId: l.vendor_id,
                  weddingId: id,
                  category: l.vendors?.category ?? null,
                }),
              )}
            />
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
