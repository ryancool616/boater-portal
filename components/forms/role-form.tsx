"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  {
    value: "owner",
    title: "Boat Owner",
    description: "Manage vessels, requests, quotes, appointments, and billing.",
  },
  {
    value: "provider",
    title: "Service Provider",
    description: "Receive requests, send quotes, manage jobs, and grow your listing.",
  },
  {
    value: "captain",
    title: "Captain",
    description: "Accept bookings, manage availability, and advertise your services.",
  },
] as const;

export function RoleForm({ currentRole }: { currentRole?: string | null }) {
  const supabase = createClient();
  const [role, setRole] = useState(currentRole ?? "owner");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveRole() {
    setLoading(true);
    setMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setMessage("You must be logged in.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = `/dashboard/${role}`;
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Choose your workspace</CardTitle>
        <CardDescription>
          You can change this later in settings, but this decides your default dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((item) => {
            const active = role === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(item.value)}
                className={[
                  "rounded-2xl border p-5 text-left transition",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white hover:border-slate-400",
                ].join(" ")}
              >
                <div className="text-lg font-semibold">{item.title}</div>
                <div className={active ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-600"}>
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>

        <Button onClick={saveRole} disabled={loading}>
          {loading ? "Saving..." : "Continue"}
        </Button>

        {message && <p className="text-sm text-slate-600">{message}</p>}
      </CardContent>
    </Card>
  );
}
