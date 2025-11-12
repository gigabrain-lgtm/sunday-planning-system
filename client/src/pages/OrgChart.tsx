import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import { orgChartData, getSubmissionLink } from "@/data/orgChart";
import { Building2, Users, Copy, CheckCircle, ExternalLink, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function OrgChart() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAgency, setEditingAgency] = useState<{id: string, name: string, slackChannelId: string, department: string} | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<{id: string, name: string} | null>(null);
  
  // Fetch agency overrides from database
  const { data: overrides } = trpc.dashboard.getAgencyOverrides.useQuery();
  
  // Merge static data with database overrides
  const mergedOrgChartData = useMemo(() => {
    if (!overrides || overrides.length === 0) return orgChartData;
    
    const overrideMap = new Map(overrides.map(o => [o.id, o]));
    
    return {
      ...orgChartData,
      departments: orgChartData.departments.map(dept => ({
        ...dept,
        agencies: dept.agencies.map(agency => {
          const override = overrideMap.get(agency.id);
          return override ? { ...agency, ...override } : agency;
        }),
      })),
      services: orgChartData.services.map(service => {
        const override = overrideMap.get(service.id);
        return override ? { ...service, ...override } : service;
      }),
    };
  }, [overrides]);

  const copySubmissionLink = (agencyId: string, agencyName: string) => {
    const link = getSubmissionLink(agencyId);
    navigator.clipboard.writeText(link);
    setCopiedId(agencyId);
    toast.success(`Copied ${agencyName} submission link!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (agency: any, departmentId: string) => {
    setEditingAgency({
      id: agency.id,
      name: agency.name,
      slackChannelId: agency.slackChannelId || '',
      department: departmentId,
    });
  };

  const updateMutation = trpc.dashboard.updateAgency.useMutation({
    onSuccess: () => {
      toast.success("Agency updated successfully!");
      setEditingAgency(null);
      // Reload page to show updated data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to update agency: ${error.message}`);
    },
  });

  const handleSaveEdit = async () => {
    if (!editingAgency) return;
    
    await updateMutation.mutateAsync({
      id: editingAgency.id,
      name: editingAgency.name,
      slackChannelId: editingAgency.slackChannelId,
      department: editingAgency.department,
    });
  };

  const handleCancelEdit = () => {
    setEditingAgency(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
              <p className="text-muted-foreground mt-1">
                Manage agency partners, submission links, and Slack channels
              </p>
            </div>

            {/* CEO Card */}
            <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {orgChartData.ceo.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{orgChartData.ceo.name}</CardTitle>
                    <CardDescription className="text-base">{orgChartData.ceo.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Departments */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Departments</h2>
              
              {mergedOrgChartData.departments.map((dept) => (
                <Card key={dept.id} className="border-2">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          {dept.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Users className="w-4 h-4 inline mr-1" />
                          {dept.teamSize} people • {dept.subTeams} teams
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDepartment({ id: dept.id, name: dept.name })}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Department
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dept.agencies.map((agency) => (
                        <Card key={agency.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              {agency.logo ? (
                                <img 
                                  src={agency.logo} 
                                  alt={agency.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <CardTitle className="text-base">{agency.name}</CardTitle>
                                {agency.slackChannelId && (
                                  <CardDescription className="text-xs font-mono">
                                    {agency.slackChannelId}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mb-2"
                              onClick={() => handleEdit(agency, dept.id)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => copySubmissionLink(agency.id, agency.name)}
                            >
                              {copiedId === agency.id ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Submission Link
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => window.open(getSubmissionLink(agency.id), '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Test Link
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services */}
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold">Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mergedOrgChartData.services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>
                        {service.subName}
                      </CardDescription>
                      <CardDescription className="text-xs font-mono mt-2">
                        {service.slackChannelId}
                      </CardDescription>
                      <CardDescription className="mt-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        {service.teamSize} people • {service.subTeams} teams
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mb-2"
                        onClick={() => handleEdit(service, 'services')}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => copySubmissionLink(service.id, service.name)}
                      >
                        {copiedId === service.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Submission Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => window.open(getSubmissionLink(service.id), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Link
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📋 How to Use</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Each agency has a unique submission link</li>
                <li>• Click "Copy Submission Link" to get the URL for an agency</li>
                <li>• Share the link with the agency - their name will be pre-filled</li>
                <li>• When content is marked complete, they'll get a Slack notification</li>
              </ul>
            </div>
          </div>
        </div>
      </Sidebar>

      {/* Edit Dialog */}
      <Dialog open={!!editingAgency} onOpenChange={() => setEditingAgency(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agency</DialogTitle>
            <DialogDescription>
              Update agency name, department, and Slack channel.
            </DialogDescription>
          </DialogHeader>
          {editingAgency && (
            <div className="space-y-4">
              <div>
                <Label>Agency Name</Label>
                <Input
                  value={editingAgency.name}
                  onChange={(e) => setEditingAgency({...editingAgency, name: e.target.value})}
                  placeholder="e.g., Mogul Media"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Select
                  value={editingAgency.department}
                  onValueChange={(value) => setEditingAgency({...editingAgency, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                          {mergedOrgChartData.departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Slack Channel ID</Label>
                <Input
                  value={editingAgency.slackChannelId}
                  onChange={(e) => setEditingAgency({...editingAgency, slackChannelId: e.target.value})}
                  placeholder="e.g., C09Q0RUN0Q0"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department name.
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <div className="space-y-4">
              <div>
                <Label>Department Name</Label>
                <Input
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                  placeholder="e.g., Branding Development (Content)"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDepartment(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => {
              toast.info("Department name changes are view-only. To update, edit the orgChart.ts file.");
              setEditingDepartment(null);
            }}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
