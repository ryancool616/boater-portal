import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe, createOrGetConnectAccount } from "@/lib/stripe";

export async function ensureConnectedAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found");
  }

  if (profile.role !== "provider" && profile.role !== "captain") {
    throw new Error("Only providers and captains can use Connect");
  }

  const { data: payoutAccount } = await supabaseAdmin
    .from("payout_accounts")
    .select("id,stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripeAccountId = await createOrGetConnectAccount({
    existingAccountId: payoutAccount?.stripe_account_id,
    email: profile.email,
    businessType: "individual",
  });

  if (!payoutAccount) {
    await supabaseAdmin.from("payout_accounts").insert({
      user_id: user.id,
      stripe_account_id: stripeAccountId,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    });
  }

  return { user, profile, stripeAccountId };
}

export async function refreshConnectedAccount(stripeAccountId: string, userId: string) {
  const account = await stripe.accounts.retrieve(stripeAccountId);

  await supabaseAdmin
    .from("payout_accounts")
    .upsert({
      user_id: userId,
      stripe_account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      onboarding_complete: account.details_submitted && account.charges_enabled && account.payouts_enabled,
      updated_at: new Date().toISOString(),
    });

  return account;
}
