import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMarketplacePaymentIntent, getPayeeForAppointment } from "@/lib/payments";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId } = (await req.json()) as { appointmentId?: string };

  if (!appointmentId) {
    return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
  }

  try {
    const payee = await getPayeeForAppointment(appointmentId);

    if (!payee.amountCents || payee.amountCents <= 0) {
      return NextResponse.json({ error: "Appointment amount must be set before payment" }, { status: 400 });
    }

    const intent = await createMarketplacePaymentIntent({
      appointmentId,
      ownerId: user.id,
      payeeUserId: payee.payeeUserId,
      stripeAccountId: payee.stripeAccountId,
      amountCents: payee.amountCents,
      currency: payee.currency,
    });

    return NextResponse.json({
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      status: intent.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create payment intent";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
