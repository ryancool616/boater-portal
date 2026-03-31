import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VercelDeployChecklistPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Vercel deployment checklist</CardTitle>
          <CardDescription>Open this page after cloning the project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>1. Create a Supabase project and run `supabase/schema.sql`.</p>
          <p>2. Create Stripe products, prices, and enable Connect if needed.</p>
          <p>3. Set all environment variables in Vercel.</p>
          <p>4. Set Stripe webhook to `/api/stripe/webhook`.</p>
          <p>5. Add Supabase auth site URL and redirect URL.</p>
          <p>6. Test signup, role selection, billing, Connect onboarding, and appointment payment.</p>
        </CardContent>
      </Card>
    </div>
  );
}
