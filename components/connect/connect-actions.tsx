"use client";

import { Button } from "@/components/ui/button";

export function StartOnboardingButton() {
  async function handleClick() {
    const res = await fetch("/api/connect/account-link", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return <Button onClick={handleClick}>Start payout onboarding</Button>;
}

export function ContinueOnboardingButton() {
  async function handleClick() {
    const res = await fetch("/api/connect/account-link", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return <Button variant="outline" onClick={handleClick}>Continue onboarding</Button>;
}

export function OpenStripeDashboardButton() {
  async function handleClick() {
    const res = await fetch("/api/connect/dashboard-link", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return <Button variant="outline" onClick={handleClick}>Open Stripe dashboard</Button>;
}
