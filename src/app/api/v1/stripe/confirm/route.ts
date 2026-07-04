import { requireUser } from "@/lib/api/http";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_PRICING } from "@/lib/vendors/categories";
import { NextResponse } from "next/server";

// GET /api/v1/stripe/confirm?session_id=... — verifică plata la întoarcerea din
// Stripe Checkout (fără webhook) și deblochează lead-ul, apoi redirect în app.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const leadsUrl = `${origin}/vendor/leads`;

  const { user } = await requireUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(leadsUrl);

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const meta = session.metadata ?? {};
  if (
    session.payment_status !== "paid" ||
    meta.kind !== "cpl_lead" ||
    !meta.lead_id ||
    !meta.vendor_id
  ) {
    return NextResponse.redirect(leadsUrl);
  }

  const admin = createAdminClient();
  // Verifică proprietarul lead-ului.
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, user_id, tier")
    .eq("id", meta.vendor_id)
    .maybeSingle();
  if (!vendor || vendor.user_id !== user.id) {
    return NextResponse.redirect(leadsUrl);
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Idempotent: dacă plata e deja înregistrată, doar redirecționăm.
  if (paymentIntentId) {
    const { data: existing } = await admin
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (existing) return NextResponse.redirect(`${leadsUrl}?unlocked=1`);
  }

  await admin
    .from("leads")
    .update({
      is_unlocked_by_vendor: true,
      unlocked_at: new Date().toISOString(),
      status: "unlocked",
    })
    .eq("id", meta.lead_id);

  await admin.from("payments").insert({
    vendor_id: meta.vendor_id,
    lead_id: meta.lead_id,
    payment_type: "cpl_lead",
    amount: TIER_PRICING[vendor.tier].cplRON,
    currency: "RON",
    stripe_payment_intent_id: paymentIntentId,
    status: "succeeded",
  });

  return NextResponse.redirect(`${leadsUrl}?unlocked=1`);
}
