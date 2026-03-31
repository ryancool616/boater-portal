import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { createMarketplacePaymentIntent, getPayeeForAppointment } from "@/lib/payments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StripeElementsCheckout } from "@/components/payments/stripe-elements-checkout";

export default async function AppointmentPaymentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const { profile } = await requireRole();

  if (profile.role !== "owner") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id,title,status,amount_cents,currency,owner_id")
    .eq("id", appointmentId)
    .eq("owner_id", profile.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!appointment) {
    notFound();
  }

  if (!appointment.amount_cents || appointment.amount_cents <= 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment unavailable</CardTitle>
            <CardDescription>This appointment does not have a payable amount yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>Set `amount_cents` on the appointment before collecting payment.</p>
            <Button asChild variant="outline">
              <Link href="/appointments">Back to appointments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payee = await getPayeeForAppointment(appointmentId);

  const intent = await createMarketplacePaymentIntent({
    appointmentId,
    ownerId: profile.id,
    payeeUserId: payee.payeeUserId,
    stripeAccountId: payee.stripeAccountId,
    amountCents: payee.amountCents,
    currency: payee.currency,
  });

  const amountLabel = `$${(appointment.amount_cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-xl">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-sm text-sky-300">Appointment payment</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{appointment.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Secure owner payment routed through your marketplace flow.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="text-sm text-slate-300">Amount due</div>
            <div className="mt-2 text-2xl font-semibold">{amountLabel}</div>
            <div className="mt-1 text-sm text-slate-300">Status: {appointment.status}</div>
          </div>
        </CardContent>
      </Card>

      <StripeElementsCheckout
        clientSecret={intent.client_secret!}
        amountLabel={amountLabel}
      />
    </div>
  );
}
