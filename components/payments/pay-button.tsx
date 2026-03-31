"use client";

import { Button } from "@/components/ui/button";

export function PayForAppointmentButton({ appointmentId }: { appointmentId: string }) {
  async function handlePay() {
    const res = await fetch("/api/payments/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    alert(
      "Starter payment intent created. Next step is wiring Stripe Elements or Checkout to confirm payment. PaymentIntent: " +
        data.paymentIntentId,
    );
  }

  return <Button onClick={handlePay}>Pay now</Button>;
}
