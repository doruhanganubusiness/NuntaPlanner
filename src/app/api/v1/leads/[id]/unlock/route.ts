import { fail, ok, requireUser } from "@/lib/api/http";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_PRICING, categoryLabel } from "@/lib/vendors/categories";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/v1/leads/:id/unlock — creează o sesiune Stripe Checkout (CPL).
// Furnizorul plătește ca să dezvăluie contactul mirelui.
export async function POST(req: Request, { params }: Ctx) {
  const { id: leadId } = await params;
  const { user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  // Citim cu admin client (bypass RLS), dar verificăm manual proprietarul.
  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id, vendor_id, is_unlocked_by_vendor")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return fail("Lead inexistent", 404);
  if (lead.is_unlocked_by_vendor) return fail("Lead deja deblocat", 400);

  const { data: vendor } = await admin
    .from("vendors")
    .select("id, user_id, tier, category")
    .eq("id", lead.vendor_id)
    .maybeSingle();
  if (!vendor || vendor.user_id !== user.id) return fail("Interzis", 403);

  const pricing = TIER_PRICING[vendor.tier];
  const origin = new URL(req.url).origin;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "ron",
          unit_amount: pricing.cplRON * 100,
          product_data: {
            name: `Deblocare contact — ${categoryLabel(vendor.category)}`,
          },
        },
      },
    ],
    metadata: { lead_id: leadId, vendor_id: vendor.id, kind: "cpl_lead" },
    success_url: `${origin}/vendor/leads?unlocked=1`,
    cancel_url: `${origin}/vendor/leads`,
  });

  return ok({ url: session.url });
}
