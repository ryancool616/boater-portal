"use client";

import { Button } from "@/components/ui/button";

export function CheckoutButton({ priceKey }: { priceKey: "premiumOwner" | "provider" }) {
  async function handleCheckout() {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceKey }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return <Button onClick={handleCheckout}>Start subscription</Button>;
}
