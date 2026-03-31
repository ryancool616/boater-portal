import { requireRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VesselsPage() {
  const { profile } = await requireRole();
  if (profile.role !== "owner") redirect("/dashboard");

  const supabase = await createClient();

  const { data: vessels, error } = await supabase
    .from("vessels")
    .select("id,name,make,model,year,home_port")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your vessels</CardTitle>
          <CardDescription>Owner-only vessel records from Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-red-600">{error.message}</p>}
          {!error && (!vessels || vessels.length === 0) && (
            <p className="text-sm text-slate-600">No vessels yet. Insert one in Supabase or add a create form.</p>
          )}
          {vessels?.map((vessel) => (
            <div key={vessel.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="font-medium">{vessel.name}</div>
              <div className="text-sm text-slate-600">
                {vessel.year} {vessel.make} {vessel.model}
              </div>
              <div className="text-sm text-slate-500">{vessel.home_port}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
