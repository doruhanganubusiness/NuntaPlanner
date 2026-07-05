import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIER_PRICING } from "@/lib/vendors/categories";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/http";
import type Stripe from "stripe";

// GET /api/v1/stripe/confirm-subscription?session_id=... — verifică plata
// inițială a abonamentului la întoarcerea din Checkout (fără webhook) și scrie
// abonamentul + plata, apoi redirecționează în panoul furnizorului.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const subUrl = `${origin}/vendor/subscription`;

  const { user } = await requireUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(subUrl);

  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  const meta = session.metadata ?? {};
  if (
    session.status !== "complete" ||
    meta.kind !== "subscription" ||
    !meta.vendor_id
  ) {
    return NextResponse.redirect(subUrl);
  }

  const admin = createAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, user_id, tier")
    .eq("id", meta.vendor_id)
    .maybeSingle();
  if (!vendor || vendor.user_id !== user.id) {
    return NextResponse.redirect(subUrl);
  }

  const subscription =
    typeof session.subscription === "string"
      ? null
      : (session.subscription as Stripe.Subscription | null);
  const stripeSubId =
    typeof session.subscription === "string"
      ? session.subscription
      : (subscription?.id ?? null);

  // Idempotent: dacă abonamentul e deja înregistrat, doar redirecționăm.
  if (stripeSubId) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", stripeSubId)
      .maybeSingle();
    if (existing) return NextResponse.redirect(`${subUrl}?active=1`);
  }

  // Data reînnoirii: din Stripe dacă e disponibilă, altfel +1 lună de la azi.
  // În API-ul curent, perioada e pe item-ul de abonament, nu la nivel de sub.
  const periodEnd = subscription?.items?.data[0]?.current_period_end;
  const nextRenewal =
    typeof periodEnd === "number"
      ? new Date(periodEnd * 1000)
      : new Date(new Date().setMonth(new Date().getMonth() + 1));
  const nextRenewalDate = nextRenewal.toISOString().slice(0, 10);
  const startDate = new Date().toISOString().slice(0, 10);
  const pricing = TIER_PRICING[vendor.tier];

  await admin.from("subscriptions").insert({
    vendor_id: vendor.id,
    tier: vendor.tier,
    monthly_price: pricing.monthlyRON,
    subscription_start_date: startDate,
    renewal_day_of_month: new Date().getDate(),
    stripe_subscription_id: stripeSubId,
    status: "active",
    next_renewal_date: nextRenewalDate,
  });

  await admin.from("payments").insert({
    vendor_id: vendor.id,
    payment_type: "subscription_monthly",
    amount: pricing.monthlyRON,
    currency: "RON",
    stripe_subscription_id: stripeSubId,
    status: "succeeded",
  });

  return NextResponse.redirect(`${subUrl}?active=1`);
}
