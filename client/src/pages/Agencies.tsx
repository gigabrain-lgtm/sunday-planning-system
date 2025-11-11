import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ExternalLink, Copy, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getAllAgencies, orgChartData } from "@/data/orgChart";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Agency {
  id: string;
  name: string;
  slackChannel: string;
  logo: string;
  teamSize: number;
}

export default function Agencies() {
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAgency, setNewAgency] = useState({
    name: "",
    slackChannel: "",
    department: "",
    logo: "",
    teamSize: 1,
  });

  // Fetch agencies from backend
  const { data: agenciesData, refetch } = trpc.agencies.getAll.useQuery();
  const createMutation = trpc.agencies.create.useMutation();
  const updateMutation = trpc.agencies.update.useMutation();
  const deleteMutation = trpc.agencies.delete.useMutation();

  const agencies = useMemo(() => agenciesData || getAllAgencies(), [agenciesData]);
  const departments = orgChartData.departments;

  const copySubmissionLink = (agencyId: string) => {
    const link = `${window.location.origin}/submissions?agency=${agencyId}`;
    navigator.clipboard.writeText(link);
    toast.success("Submission link copied to clipboard!");
  };

  const testLink = (agencyId: string) => {
    const link = `${window.location.origin}/submissions?agency=${agencyId}`;
    window.open(link, "_blank");
  };

  const handleEdit = (agency: any) => {
    setEditingAgency({
      id: agency.id,
      name: agency.name,
      slackChannel: agency.slackChannel,
      logo: agency.logo,
      teamSize: agency.teamSize,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAgency) return;

    try {
      await updateMutation.mutateAsync({
        id: editingAgency.id,
        name: editingAgency.name,
        slackChannel: editingAgency.slackChannel,
        logo: editingAgency.logo,
        teamSize: editingAgency.teamSize,
      });
      toast.success("Agency updated successfully!");
      setEditingAgency(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update agency");
    }
  };

  const handleDelete = async (agencyId: string, agencyName: string) => {
    if (!confirm(`Are you sure you want to delete "${agencyName}"?`)) return;

    try {
      await deleteMutation.mutateAsync({ id: agencyId });
      toast.success("Agency deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete agency");
    }
  };

  const handleAddAgency = async () => {
    if (!newAgency.name || !newAgency.slackChannel || !newAgency.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: newAgency.name,
        slackChannel: newAgency.slackChannel,
        department: newAgency.department,
        logo: newAgency.logo || "",
        teamSize: newAgency.teamSize,
      });
      toast.success("Agency added successfully!");
      setIsAddDialogOpen(false);
      setNewAgency({
        name: "",
        slackChannel: "",
        department: "",
        logo: "",
        teamSize: 1,
      });
      refetch();
    } catch (error) {
      toast.error("Failed to add agency");
    }
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
              <p className="text-muted-foreground mt-1">
                Manage your agency partners and their submission links
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Agency
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Agencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{agencies.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{departments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{orgChartData.services.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Departments */}
          {departments.map((dept) => (
            <Card key={dept.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <CardTitle>{dept.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dept.agencies.length} {dept.agencies.length === 1 ? "agency" : "agencies"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dept.agencies.map((agency) => (
                    <Card key={agency.id} className="relative">
                      <CardContent className="pt-6">
                        {editingAgency?.id === agency.id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div>
                              <Label>Agency Name</Label>
                              <Input
                                value={editingAgency.name}
                                onChange={(e) =>
                                  setEditingAgency({ ...editingAgency, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Slack Channel</Label>
                              <Input
                                value={editingAgency.slackChannel}
                                onChange={(e) =>
                                  setEditingAgency({ ...editingAgency, slackChannel: e.target.value })
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isLoading}
                                className="flex-1"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingAgency(null)}
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {agency.logo && (
                                  <img
                                    src={agency.logo}
                                    alt={agency.name}
                                    className="w-10 h-10 rounded"
                                  />
                                )}
                                <div>
                                  <h3 className="font-semibold">{agency.name}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {agency.teamSize} {agency.teamSize === 1 ? "person" : "people"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(agency)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(agency.id, agency.name)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Slack:</span> {agency.slackChannel}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copySubmissionLink(agency.id)}
                                  className="flex-1"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Link
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testLink(agency.id)}
                                  className="flex-1"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Test
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Services */}
          {orgChartData.services.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle>Services</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {orgChartData.services.length} service{orgChartData.services.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orgChartData.services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {service.logo && (
                              <img
                                src={service.logo}
                                alt={service.name}
                                className="w-10 h-10 rounded"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold">{service.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {service.teamSize} {service.teamSize === 1 ? "person" : "people"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Slack:</span> {service.slackChannel}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copySubmissionLink(service.id)}
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Link
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testLink(service.id)}
                              className="flex-1"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Test
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Agency Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Agency</DialogTitle>
            <DialogDescription>
              Create a new agency partner with submission link
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Agency Name *</Label>
              <Input
                value={newAgency.name}
                onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                placeholder="e.g., Mogul Media"
              />
            </div>
            <div>
              <Label>Department *</Label>
              <Select
                value={newAgency.department}
                onValueChange={(value) => setNewAgency({ ...newAgency, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Slack Channel ID *</Label>
              <Input
                value={newAgency.slackChannel}
                onChange={(e) => setNewAgency({ ...newAgency, slackChannel: e.target.value })}
                placeholder="e.g., C09Q0RUN0Q0"
              />
            </div>
            <div>
              <Label>Logo URL (Optional)</Label>
              <Input
                value={newAgency.logo}
                onChange={(e) => setNewAgency({ ...newAgency, logo: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Team Size</Label>
              <Input
                type="number"
                value={newAgency.teamSize}
                onChange={(e) => setNewAgency({ ...newAgency, teamSize: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAgency}
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Adding..." : "Add Agency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
