import { requireRole } from "@/lib/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MessagesPage() {
  const { profile } = await requireRole();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Unified message center for the {profile.role} workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          Add Supabase realtime or a dedicated messaging service next.
        </CardContent>
      </Card>
    </div>
  );
}
