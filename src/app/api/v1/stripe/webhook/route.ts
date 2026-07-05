import { getStripe, stripeWebhookSecret } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, VendorTierDb } from "@/lib/supabase/database.types";
import { TIER_PRICING } from "@/lib/vendors/categories";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

type Admin = SupabaseClient<Database>;

// POST /api/v1/stripe/webhook — evenimente Stripe (semnătură verificată).
// Tratează: deblocarea CPL (checkout.session.completed), plata inițială și
// reînnoirile de abonament (invoice.paid) și încheierea abonamentului
// (customer.subscription.deleted). Toate operațiile sunt idempotente.
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

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        admin,
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "invoice.paid":
      await handleInvoicePaid(admin, event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        admin,
        event.data.object as Stripe.Subscription,
      );
      break;
  }

  return NextResponse.json({ received: true });
}

// ------------------------------------------------------------------
// Deblocare CPL per lead (plata unică). Abonamentele sunt tratate prin
// invoice.paid, nu aici — sesiunile lor au kind='subscription' și se ignoră.
// ------------------------------------------------------------------
async function handleCheckoutCompleted(
  admin: Admin,
  session: Stripe.Checkout.Session,
) {
  const meta = session.metadata ?? {};
  if (meta.kind !== "cpl_lead" || !meta.lead_id || !meta.vendor_id) return;

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
    if (existing) return;
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

// ------------------------------------------------------------------
// Abonament plătit (inițial sau reînnoire). Sincronizează rândul din
// `subscriptions` cu perioada curentă din Stripe — sursa de adevăr pentru
// reînnoirea automată (ce nu putea face fluxul „fără webhook").
// ------------------------------------------------------------------
async function handleInvoicePaid(admin: Admin, invoice: Stripe.Invoice) {
  // În API-ul curent, abonamentul e pe `parent.subscription_details`.
  const subRef = invoice.parent?.subscription_details?.subscription;
  if (!subRef) return; // factură non-abonament — ignorăm.
  const subId = typeof subRef === "string" ? subRef : subRef.id;

  const subscription = await getStripe().subscriptions.retrieve(subId);
  const meta = subscription.metadata ?? {};
  const vendorId = meta.vendor_id;
  if (meta.kind !== "subscription" || !vendorId) return; // nu e al nostru.
  const tier = meta.tier as VendorTierDb;

  const periodEnd = subscription.items.data[0]?.current_period_end;
  const nextRenewalDate = (
    typeof periodEnd === "number"
      ? new Date(periodEnd * 1000)
      : new Date(new Date().setMonth(new Date().getMonth() + 1))
  )
    .toISOString()
    .slice(0, 10);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (existing) {
    // Reînnoire: prelungește accesul și reactivează dacă era necesar.
    await admin
      .from("subscriptions")
      .update({ next_renewal_date: nextRenewalDate, status: "active" })
      .eq("id", existing.id);
  } else {
    // Fallback: abonament fără confirmarea la întoarcere — îl înregistrăm aici.
    await admin.from("subscriptions").insert({
      vendor_id: vendorId,
      tier,
      monthly_price: TIER_PRICING[tier].monthlyRON,
      subscription_start_date: new Date().toISOString().slice(0, 10),
      renewal_day_of_month: new Date().getDate(),
      stripe_subscription_id: subId,
      status: "active",
      next_renewal_date: nextRenewalDate,
    });
  }

  // Jurnalizează plata doar la REÎNNOIRE (plata inițială o scrie confirm-return);
  // idempotent pe id-ul facturii (stocat în coloana stripe_payment_intent_id).
  if (invoice.billing_reason === "subscription_cycle" && invoice.id) {
    const { data: paid } = await admin
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", invoice.id)
      .maybeSingle();
    if (!paid) {
      await admin.from("payments").insert({
        vendor_id: vendorId,
        payment_type: "subscription_monthly",
        amount: (invoice.amount_paid ?? 0) / 100 || TIER_PRICING[tier].monthlyRON,
        currency: "RON",
        stripe_subscription_id: subId,
        stripe_payment_intent_id: invoice.id,
        status: "succeeded",
      });
    }
  }
}

// ------------------------------------------------------------------
// Abonament încheiat definitiv la Stripe (după anulare/expirare) → oprim
// accesul marcând rândul ca `cancelled`.
// ------------------------------------------------------------------
async function handleSubscriptionDeleted(
  admin: Admin,
  subscription: Stripe.Subscription,
) {
  await admin
    .from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id);
}
