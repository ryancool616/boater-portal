import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICE_IDS = {
  premiumOwner: process.env.STRIPE_PREMIUM_OWNER_PRICE_ID!,
  provider: process.env.STRIPE_PROVIDER_PRICE_ID!,
} as const;

export async function createOrGetConnectAccount(params: {
  existingAccountId?: string | null;
  email?: string | null;
  businessType?: "individual" | "company";
}) {
  if (params.existingAccountId) {
    return params.existingAccountId;
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: params.email ?? undefined,
    business_type: params.businessType ?? "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      source: "boater-portal",
    },
  });

  return account.id;
}
