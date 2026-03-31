import Link from "next/link";
import { requireRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ payment?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const { profile } = await requireRole();
  const supabase = await createClient();

  if (profile.role === "owner") {
    const { data: appointments } = await supabase
      .from("appointments")
      .select("id,title,status,amount_cents,currency,created_at")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false });

    return (
      <div className="space-y-6">
        {params.payment === "success" ? (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 text-sm text-emerald-800">
              Payment completed successfully.
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Your appointments</CardTitle>
            <CardDescription>Owner-side bookings with payment actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments?.length ? appointments.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {item.status} • {item.amount_cents ? `$${(item.amount_cents / 100).toFixed(2)}` : "No price yet"}
                    </div>
                  </div>
                  {item.amount_cents ? (
                    <Button asChild>
                      <Link href={`/payments/${item.id}`}>Pay now</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No appointments yet.</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile.role === "provider" || profile.role === "captain") {
    const column = profile.role === "provider" ? "provider_id" : "captain_id";
    const { data: appointments } = await supabase
      .from("appointments")
      .select("id,title,status,amount_cents,currency,created_at")
      .eq(column, profile.id)
      .order("created_at", { ascending: false });

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{profile.role === "provider" ? "Assigned jobs" : "Captain bookings"}</CardTitle>
            <CardDescription>Role-scoped appointments from Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments?.length ? appointments.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {item.status} • {item.amount_cents ? `$${(item.amount_cents / 100).toFixed(2)}` : "No price yet"}
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No appointments yet.</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  redirect("/dashboard");
}
