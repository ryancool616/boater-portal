import { redirect } from "next/navigation";
import type { Route } from "next";
import { requireRole } from "@/lib/roles";

export default async function DashboardIndexPage() {
  const { profile } = await requireRole();
  redirect((`/dashboard/${profile.role}`) as Route);
}