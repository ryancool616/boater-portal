import { requireRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/dashboard/stats-grid";

export default async function OwnerDashboardPage() {
  const { profile } = await requireRole();
  const supabase = await createClient();

  const { count: vesselCount } = await supabase
    .from("vessels")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", profile.id);

  const { count: requestCount } = await supabase
    .from("service_requests")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", profile.id);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-xl">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-sm text-sky-300">Owner workspace</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Boat owner dashboard.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Owners can manage vessels, service requests, quotes, bookings, files, and subscriptions here.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="text-sm text-slate-300">Snapshot</div>
            <div className="mt-2 text-lg font-medium">{vesselCount ?? 0} vessels</div>
            <div className="mt-1 text-sm text-slate-300">{requestCount ?? 0} service requests</div>
          </div>
        </CardContent>
      </Card>

      <StatsGrid />

      <Card>
        <CardHeader>
          <CardTitle>Role-aware routing is active</CardTitle>
          <CardDescription>Your role determines this dashboard and nav automatically.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
