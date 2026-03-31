import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RoleForm } from "@/components/forms/role-form";

export default async function RoleOnboardingPage() {
  await requireUser();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <RoleForm currentRole={profile?.role} />
    </main>
  );
}
