import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id:
        typeof session.subscription === "string" ? session.subscription : null,
      status: "active",
      price_key: session.metadata?.price_key ?? null,
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: subscription.status,
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await supabaseAdmin
      .from("payout_accounts")
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        onboarding_complete: account.details_submitted && account.charges_enabled && account.payouts_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_account_id", account.id);
  }

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await supabaseAdmin
      .from("payments")
      .update({
        status: intent.status,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", intent.id);
  }

  return NextResponse.json({ received: true });
}
