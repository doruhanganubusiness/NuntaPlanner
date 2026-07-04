import { getStripe, stripeWebhookSecret } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_PRICING } from "@/lib/vendors/categories";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// POST /api/v1/stripe/webhook — evenimente Stripe (semnătură verificată).
// La plata reușită a unui lead (CPL), deblochează contactul și scrie plata.
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, stripeWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid";
    return new NextResponse(`Webhook error: ${msg}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.kind === "cpl_lead" && meta.lead_id && meta.vendor_id) {
      const admin = createAdminClient();
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      // Idempotent: dacă plata e deja înregistrată, nu repetăm.
      if (paymentIntentId) {
        const { data: existing } = await admin
          .from("payments")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();
        if (existing) return NextResponse.json({ received: true });
      }

      const { data: vendor } = await admin
        .from("vendors")
        .select("tier")
        .eq("id", meta.vendor_id)
        .maybeSingle();
      const amount = vendor
        ? TIER_PRICING[vendor.tier].cplRON
        : (session.amount_total ?? 0) / 100;

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
        amount,
        currency: "RON",
        stripe_payment_intent_id: paymentIntentId,
        status: "succeeded",
      });
    }
  }

  return NextResponse.json({ received: true });
}
