import Link from "next/link";
import { Home, Ship, CreditCard, ClipboardList, MessageSquare, Calendar, DollarSign, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppRole } from "@/lib/roles";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ownerNav: NavItem[] = [
  { href: "/dashboard/owner", label: "Overview", icon: Home },
  { href: "/vessels", label: "Vessels", icon: Ship },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/requests", label: "Requests", icon: ClipboardList },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

const providerNav: NavItem[] = [
  { href: "/dashboard/provider", label: "Overview", icon: Home },
  { href: "/requests", label: "Request Board", icon: ClipboardList },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

const captainNav: NavItem[] = [
  { href: "/dashboard/captain", label: "Overview", icon: Home },
  { href: "/appointments", label: "Bookings", icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

function getNav(role: AppRole) {
  if (role === "provider") return providerNav;
  if (role === "captain") return captainNav;
  return ownerNav;
}

export function WorkspaceShell({
  children,
  role,
  email,
}: {
  children: React.ReactNode;
  role: AppRole;
  email: string | null | undefined;
}) {
  const nav = getNav(role);

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6">
          <div className="mb-8">
            <div className="text-xl font-semibold">Boater Portal</div>
            <div className="text-sm text-slate-500">{email}</div>
          </div>

          <nav className="space-y-2 text-sm">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100" href={item.href as any}> hover:bg-slate-100" href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Card className="mt-8 border-0 bg-slate-950 text-white">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-sky-300">
                <UserRound className="h-4 w-4" />
                Active role
              </div>
              <div className="text-lg font-semibold capitalize">{role}</div>
              <p className="mt-2 text-sm text-slate-300">
                This workspace is role-scoped. Expand this with deeper permissions and custom menus.
              </p>
            </CardContent>
          </Card>

          <form action="/auth/signout" method="post" className="mt-6">
            <Button variant="outline" type="submit">Sign out</Button>
          </form>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
