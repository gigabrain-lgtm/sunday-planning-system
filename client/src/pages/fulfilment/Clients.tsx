import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function FulfilmentClients() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          Clients
        </h1>
        <p className="text-muted-foreground">
          Manage ClickUp clients and MRP seller mappings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>View and configure client settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Client management functionality will be migrated here from the listing-optimization app.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Features: ClickUp client sync, seller mappings, client details, filtering
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
