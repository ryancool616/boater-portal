import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ensureConnectedAccount, refreshConnectedAccount } from "@/lib/connect";

export async function POST() {
  try {
    const { user, stripeAccountId } = await ensureConnectedAccount();

    await refreshConnectedAccount(stripeAccountId, user.id);

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/provider?connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/provider?connect=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create onboarding link";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
