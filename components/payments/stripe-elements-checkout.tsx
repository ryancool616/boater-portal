"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutInner({
  clientSecret,
  amountLabel,
}: {
  clientSecret: string;
  amountLabel: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/appointments?payment=success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setMessage(result.error.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    setMessage("Payment submitted successfully.");
    setLoading(false);
    window.location.href = "/appointments?payment=success";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete payment</CardTitle>
        <CardDescription>Secure card payment for this appointment.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <PaymentElement />
          </div>
          <Button type="submit" className="w-full" disabled={!stripe || loading}>
            {loading ? "Processing..." : `Pay ${amountLabel}`}
          </Button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

export function StripeElementsCheckout({
  clientSecret,
  amountLabel,
}: {
  clientSecret: string;
  amountLabel: string;
}) {
  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutInner clientSecret={clientSecret} amountLabel={amountLabel} />
    </Elements>
  );
}
