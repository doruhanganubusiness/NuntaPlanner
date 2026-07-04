import Stripe from "stripe";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variabila de mediu ${name} lipsește. Adaug-o în .env.local și în Vercel.`,
    );
  }
  return value;
}

export const stripeSecretKey = () =>
  required("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);

export const stripeWebhookSecret = () =>
  required("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET);

let cached: Stripe | null = null;

/** Instanță Stripe (server-only). Cheia se citește lazy, la runtime. */
export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(stripeSecretKey());
  }
  return cached;
}
