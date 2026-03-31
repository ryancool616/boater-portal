"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=${encodeURIComponent("/onboarding/role")}`,
          data: { full_name: fullName },
        },
      });

      setLoading(false);
      setMessage(error ? error.message : "Check your email to confirm your account.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = next;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Log in" : "Create your account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Access your Boater Portal workspace."
            : "Start with Supabase email auth and then choose your role."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "signup" && (
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        )}
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
        </Button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </CardContent>
    </Card>
  );
}
