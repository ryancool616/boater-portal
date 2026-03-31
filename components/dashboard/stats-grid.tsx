import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsGrid() {
  const items = [
    { label: "Open Requests", value: "4" },
    { label: "Upcoming Appointments", value: "3" },
    { label: "Stored Documents", value: "12" },
    { label: "Premium Plan", value: "Active" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-base">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
