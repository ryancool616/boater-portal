import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "owner" | "provider" | "captain";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return { user, profile };
}

export async function requireRole() {
  const { user, profile } = await getCurrentProfile();

  if (!profile?.role) {
    redirect("/onboarding/role");
  }

  return { user, profile: profile as NonNullable<typeof profile> & { role: AppRole } };
}
