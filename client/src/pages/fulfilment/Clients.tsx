import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, RefreshCw, ExternalLink } from "lucide-react";

interface ClickUpClient {
  id: number;
  clickupTaskId: string;
  clickupUrl: string | null;
  clientName: string;
  brandName: string | null;
  company: string | null;
  status: string | null;
  defcon: number;
  amOwner: string | null;
  ppcOwner: string | null;
  creativeOwner: string | null;
  podOwner: string | null;
  totalAsinsFam: string | null;
  totalAsinsPpc: string | null;
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
        client.clientName?.toLowerCase().includes(searchLower) ||
        client.brandName?.toLowerCase().includes(searchLower) ||
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
      1: { className: "bg-red-900/50 text-red-200 border-red-800", label: "DEFCON 1" },
      2: { className: "bg-yellow-900/50 text-yellow-200 border-yellow-800", label: "DEFCON 2" },
      3: { className: "bg-green-900/50 text-green-200 border-green-800", label: "DEFCON 3" },
    };
    return variants[defcon as keyof typeof variants] || variants[3];
  };

  const getStatusBadge = (status: string) => {
    if (!status) return { className: "bg-gray-800 text-gray-300 border-gray-700", label: "Unknown" };
    const lower = status.toLowerCase();
    if (lower === 'active') return { className: "bg-green-900/50 text-green-200 border-green-800", label: "Active" };
    if (lower === 'paused') return { className: "bg-yellow-900/50 text-yellow-200 border-yellow-800", label: "Paused" };
    if (lower === 'churned') return { className: "bg-red-900/50 text-red-200 border-red-800", label: "Churned" };
    return { className: "bg-gray-800 text-gray-300 border-gray-700", label: status };
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-950 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-white">
              <Users className="h-8 w-8" />
              Clients
            </h1>
            <p className="text-gray-400">
              Manage ClickUp clients and MRP seller mappings
            </p>
          </div>
          <Button onClick={() => refetch()} variant="default" className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search clients by name, brand, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="active" className="text-white">Active</SelectItem>
                <SelectItem value="paused" className="text-white">Paused</SelectItem>
                <SelectItem value="churned" className="text-white">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={defconFilter} onValueChange={setDefconFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Priority</SelectItem>
                <SelectItem value="1" className="text-white">DEFCON 1</SelectItem>
                <SelectItem value="2" className="text-white">DEFCON 2</SelectItem>
                <SelectItem value="3" className="text-white">DEFCON 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Client List</h2>
            <p className="text-sm text-gray-400">{clients.length} clients found</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-400">
              <p>Error loading clients: {error.message}</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="h-12 w-12 mb-4" />
              <p className="font-medium">No clients found</p>
              <p className="text-sm">No clients have been synced from ClickUp yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">AM Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {clients.map((client: ClickUpClient) => {
                    const defconBadge = getDefconBadge(client.defcon);
                    const statusBadge = getStatusBadge(client.status);
                    
                    return (
                      <tr key={client.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{client.clientName}</div>
                          {client.clickupUrl && (
                            <a href={client.clickupUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                              View in ClickUp
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {client.brandName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {client.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {client.amOwner || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={defconBadge.className}>
                            {defconBadge.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
