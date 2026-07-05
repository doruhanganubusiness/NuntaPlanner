import { fail, ok, requireUser } from "@/lib/api/http";
import { getStripe } from "@/lib/stripe/server";
import { getOrCreateMonthlyPrice } from "@/lib/stripe/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscription } from "@/lib/vendors/subscription";

// POST /api/v1/subscriptions — pornește un abonament lunar (Stripe Checkout,
// mode: subscription). Plata inițială se confirmă la întoarcere (fără webhook).
export async function POST(req: Request) {
  const { user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const admin = createAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, user_id, tier, business_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!vendor) return fail("Furnizor inexistent", 404);

  if (await getActiveSubscription(admin, vendor.id)) {
    return fail("Ai deja un abonament activ", 400);
  }

  const priceId = await getOrCreateMonthlyPrice(vendor.tier);
  const origin = new URL(req.url).origin;
  const meta = { vendor_id: vendor.id, tier: vendor.tier, kind: "subscription" };

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: meta,
    subscription_data: { metadata: meta },
    success_url: `${origin}/api/v1/stripe/confirm-subscription?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/vendor/subscription`,
  });

  return ok({ url: session.url });
}

// PATCH /api/v1/subscriptions — anulează abonamentul la finalul perioadei plătite.
export async function PATCH() {
  const { user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const admin = createAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!vendor) return fail("Furnizor inexistent", 404);

  const sub = await getActiveSubscription(admin, vendor.id);
  if (!sub) return fail("Nu ai un abonament activ", 400);

  if (sub.stripe_subscription_id) {
    await getStripe().subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  }

  // Rămâne activ până la `next_renewal_date`; marcăm doar momentul anulării.
  await admin
    .from("subscriptions")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", sub.id);

  return ok({ ok: true });
}
