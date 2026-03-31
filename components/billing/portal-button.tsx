"use client";

import { Button } from "@/components/ui/button";

export function PortalButton() {
  async function openPortal() {
    const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return <Button variant="outline" onClick={openPortal}>Manage billing</Button>;
}
