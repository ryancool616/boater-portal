import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

const REUSABLE_INTENT_STATUSES = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
  "processing",
]);

export async function getPayeeForAppointment(appointmentId: string) {
  const { data: appointment, error } = await supabaseAdmin
    .from("appointments")
    .select("id,provider_id,captain_id,amount_cents,currency,owner_id")
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !appointment) {
    throw new Error(error?.message ?? "Appointment not found");
  }

  const payeeUserId = appointment.provider_id ?? appointment.captain_id;
  if (!payeeUserId) {
    throw new Error("Appointment has no provider or captain assigned");
  }

  const { data: payout, error: payoutError } = await supabaseAdmin
    .from("payout_accounts")
    .select("stripe_account_id,onboarding_complete")
    .eq("user_id", payeeUserId)
    .maybeSingle();

  if (payoutError || !payout?.stripe_account_id) {
    throw new Error(payoutError?.message ?? "Connected payout account not found");
  }

  if (!payout.onboarding_complete) {
    throw new Error("Payee has not completed payout onboarding");
  }

  return {
    ownerId: appointment.owner_id,
    payeeUserId,
    stripeAccountId: payout.stripe_account_id,
    amountCents: appointment.amount_cents ?? 0,
    currency: appointment.currency ?? "usd",
  };
}

export function calculateApplicationFee(amountCents: number) {
  return Math.round(amountCents * 0.1);
}

export async function findReusablePaymentIntent(appointmentId: string) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("stripe_payment_intent_id,status")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment?.stripe_payment_intent_id) {
    return null;
  }

  if (!REUSABLE_INTENT_STATUSES.has(payment.status)) {
    return null;
  }

  const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
  return intent.client_secret ? intent : null;
}

export async function createMarketplacePaymentIntent(params: {
  appointmentId: string;
  ownerId: string;
  payeeUserId: string;
  stripeAccountId: string;
  amountCents: number;
  currency: string;
}) {
  const existing = await findReusablePaymentIntent(params.appointmentId);
  if (existing) {
    return existing;
  }

  const applicationFee = calculateApplicationFee(params.amountCents);

  const intent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: params.currency,
    automatic_payment_methods: { enabled: true },
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: params.stripeAccountId,
    },
    metadata: {
      appointment_id: params.appointmentId,
      owner_id: params.ownerId,
      payee_user_id: params.payeeUserId,
    },
  });

  await supabaseAdmin.from("payments").upsert({
    appointment_id: params.appointmentId,
    owner_id: params.ownerId,
    payee_user_id: params.payeeUserId,
    stripe_payment_intent_id: intent.id,
    stripe_connected_account_id: params.stripeAccountId,
    amount_cents: params.amountCents,
    application_fee_cents: applicationFee,
    currency: params.currency,
    status: intent.status,
    updated_at: new Date().toISOString(),
  });

  return intent;
}
