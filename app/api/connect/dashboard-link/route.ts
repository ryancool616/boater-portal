import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ensureConnectedAccount, refreshConnectedAccount } from "@/lib/connect";

export async function POST() {
  try {
    const { user, stripeAccountId } = await ensureConnectedAccount();
    await refreshConnectedAccount(stripeAccountId, user.id);

    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create dashboard link";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
