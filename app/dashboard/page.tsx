import { redirect } from "next/navigation";
import { requireRole } from "@/lib/roles";

export default async function DashboardIndexPage() {
  const { profile } = await requireRole();
  redirect(`/dashboard/${profile.role}`);
}
