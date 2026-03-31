import { requireRole } from "@/lib/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PortalButton } from "@/components/billing/portal-button";

export default async function BillingPage() {
  const { profile } = await requireRole();

  const priceKey = profile.role === "provider" || profile.role === "captain" ? "provider" : "premiumOwner";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            Start checkout or open the Stripe customer portal for your {profile.role} account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <CheckoutButton priceKey={priceKey} />
          <PortalButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role-based plan mapping</CardTitle>
          <CardDescription>Your role selects the default Stripe price.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>Owner → premium owner price ID</p>
          <p>Provider / captain → provider price ID</p>
        </CardContent>
      </Card>
    </div>
  );
}
