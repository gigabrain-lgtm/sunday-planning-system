import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw, ExternalLink } from "lucide-react";

interface ClickUpClient {
  id: string;
  clickup_task_id: string;
  clickup_url: string;
  client_name: string;
  brand_name: string | null;
  company: string | null;
  status: string;
  defcon: number;
  am_owner: string | null;
  ppc_owner: string | null;
  creative_owner: string | null;
  pod_owner: string | null;
  total_asins_fam: string | null;
  total_asins_ppc: string | null;
}

export default function FulfilmentClients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [defconFilter, setDefconFilter] = useState("all");

  // Fetch clients using tRPC
  const { data: allClients = [], isLoading, error, refetch } = trpc.fulfilment.getClients.useQuery();

  // Client-side filtering
  const clients = allClients.filter((client: ClickUpClient) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        client.client_name?.toLowerCase().includes(searchLower) ||
        client.brand_name?.toLowerCase().includes(searchLower) ||
        client.company?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && client.status !== statusFilter) {
      return false;
    }

    // Defcon filter
    if (defconFilter !== 'all' && client.defcon.toString() !== defconFilter) {
      return false;
    }

    return true;
  });

  const getDefconBadge = (defcon: number) => {
    const variants = {
      1: { variant: "destructive" as const, label: "🔴 Urgent" },
      2: { variant: "default" as const, label: "🟡 High" },
      3: { variant: "secondary" as const, label: "🟢 Normal" },
    };
    return variants[defcon as keyof typeof variants] || variants[3];
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "secondary";
    const lower = status.toLowerCase();
    if (lower.includes('live')) return "default";
    if (lower.includes('onboarding')) return "outline";
    if (lower.includes('paused')) return "secondary";
    if (lower.includes('churned')) return "destructive";
    return "secondary";
  };

  return (
    <Sidebar>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Clients
          </h1>
          <p className="text-muted-foreground">
            Manage ClickUp clients and MRP seller mappings
          </p>
        </div>
        <Button onClick={() => refetch()} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search clients by name, brand, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={defconFilter} onValueChange={setDefconFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="1">🔴 Urgent</SelectItem>
                <SelectItem value="2">🟡 High</SelectItem>
                <SelectItem value="3">🟢 Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Error loading clients: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${clients.length} clients found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all' || defconFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No clients have been synced from ClickUp yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Priority</th>
                    <th className="text-left p-3 text-sm font-medium">Client / Brand</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">AM Owner</th>
                    <th className="text-left p-3 text-sm font-medium">PPC Owner</th>
                    <th className="text-left p-3 text-sm font-medium">Total ASINs</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client: ClickUpClient) => {
                    const defconInfo = getDefconBadge(client.defcon);
                    return (
                      <tr key={client.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <Badge variant={defconInfo.variant}>
                            {defconInfo.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{client.client_name}</div>
                            {client.brand_name && (
                              <div className="text-sm text-muted-foreground">{client.brand_name}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusVariant(client.status)}>
                            {client.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{client.am_owner || '-'}</td>
                        <td className="p-3 text-sm">{client.ppc_owner || '-'}</td>
                        <td className="p-3 text-sm">
                          {client.total_asins_fam || client.total_asins_ppc || '-'}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={client.clickup_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </Sidebar>
  );
}
