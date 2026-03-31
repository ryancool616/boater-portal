import { requireRole } from "@/lib/roles";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole();

  return (
    <WorkspaceShell role={profile.role} email={user.email}>
      {children}
    </WorkspaceShell>
  );
}
