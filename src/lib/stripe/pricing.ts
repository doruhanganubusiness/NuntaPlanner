import { getStripe } from "@/lib/stripe/server";
import { TIER_PRICING, type VendorTier } from "@/lib/vendors/categories";

/**
 * Returnează ID-ul unui Price recurent lunar (RON) pentru un tier, creându-l
 * în Stripe la prima folosire. Reutilizabil prin `lookup_key` deterministic,
 * ca să nu creăm produse duplicate. Necesar pentru Checkout `mode: subscription`
 * (unde `price_data` inline NU e acceptat, spre deosebire de plata unică).
 */
export async function getOrCreateMonthlyPrice(tier: VendorTier): Promise<string> {
  const stripe = getStripe();
  const pricing = TIER_PRICING[tier];
  const lookupKey = `nuntaplanner_sub_${tier}_monthly`;

  const existing = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const price = await stripe.prices.create({
    currency: "ron",
    unit_amount: pricing.monthlyRON * 100,
    recurring: { interval: "month" },
    lookup_key: lookupKey,
    product_data: { name: `Abonament NuntaPlanner — ${pricing.label}` },
  });
  return price.id;
}
