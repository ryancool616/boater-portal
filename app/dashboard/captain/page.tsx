import { requireRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StartOnboardingButton, ContinueOnboardingButton, OpenStripeDashboardButton } from "@/components/connect/connect-actions";

export default async function CaptainDashboardPage() {
  const { profile } = await requireRole();
  if (profile.role !== "captain") redirect("/dashboard");

  const supabase = await createClient();
  const { data: payout } = await supabase
    .from("payout_accounts")
    .select("stripe_account_id,charges_enabled,payouts_enabled,details_submitted,onboarding_complete")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-xl">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-sm text-sky-300">Captain workspace</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Captain dashboard.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Captains can manage availability, bookings, and Stripe Connect payouts.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="text-sm text-slate-300">Workspace type</div>
            <div className="mt-2 text-lg font-medium capitalize">{profile.role}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout onboarding</CardTitle>
          <CardDescription>Connect Stripe so captain bookings can pay out to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Account</div>
              <div className="mt-1 text-sm font-medium">{payout?.stripe_account_id ?? "Not created"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Details submitted</div>
              <div className="mt-1 text-sm font-medium">{payout?.details_submitted ? "Yes" : "No"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Charges enabled</div>
              <div className="mt-1 text-sm font-medium">{payout?.charges_enabled ? "Yes" : "No"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Payouts enabled</div>
              <div className="mt-1 text-sm font-medium">{payout?.payouts_enabled ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!payout?.stripe_account_id && <StartOnboardingButton />}
            {payout?.stripe_account_id && !payout?.onboarding_complete && <ContinueOnboardingButton />}
            {payout?.stripe_account_id && <OpenStripeDashboardButton />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next captain features</CardTitle>
          <CardDescription>Suggested build-out for the captain role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>Availability calendar and trip windows</p>
          <p>Owner booking requests and confirmations</p>
          <p>Payout tracking and platform fee logic</p>
          <p>Trip logs and vessel handoff notes</p>
        </CardContent>
      </Card>
    </div>
  );
}
