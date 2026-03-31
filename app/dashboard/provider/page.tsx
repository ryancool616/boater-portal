import { requireRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StartOnboardingButton, ContinueOnboardingButton, OpenStripeDashboardButton } from "@/components/connect/connect-actions";

export default async function ProviderDashboardPage() {
  const { profile } = await requireRole();
  if (profile.role !== "provider") redirect("/dashboard");

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("service_requests")
    .select("id,title,category,priority,status,created_at")
    .order("created_at", { ascending: false })
    .limit(10);

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
            <div className="text-sm text-sky-300">Provider workspace</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Service provider dashboard.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Providers can browse requests, quote jobs, manage messages, and onboard to Stripe Connect for payouts.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="text-sm text-slate-300">Open marketplace items</div>
            <div className="mt-2 text-lg font-medium">{requests?.length ?? 0} visible requests</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout onboarding</CardTitle>
          <CardDescription>Set up your Stripe Connect account to receive payouts.</CardDescription>
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
          <CardTitle>Recent requests</CardTitle>
          <CardDescription>Starter provider request board.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests?.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-slate-600">{item.category} • {item.priority} • {item.status}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
