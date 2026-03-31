import { requireRole } from "@/lib/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RequestsPage() {
  const { profile } = await requireRole();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            Starter request workflow for the {profile.role} role.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Extend this with owner request creation or provider request board views.
        </CardContent>
      </Card>
    </div>
  );
}
