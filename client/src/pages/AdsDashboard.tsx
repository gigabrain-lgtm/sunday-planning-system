import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BarChart3, DollarSign, Loader2, Plus, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  
  const { data: stats, isLoading: statsLoading } = trpc.analytics.totalStats.useQuery();
  const { data: byRole, isLoading: roleLoading } = trpc.analytics.spendingByRole.useQuery();
  const { data: byLocation, isLoading: locationLoading } = trpc.analytics.spendingByLocation.useQuery();
  const { data: jobPostings, isLoading: postingsLoading } = trpc.jobPostings.list.useQuery();
  const { data: roles } = trpc.roles.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.jobPostings.create.useMutation({
    onSuccess: () => {
      utils.jobPostings.list.invalidate();
      utils.analytics.invalidate();
      setIsCreateOpen(false);
      setSelectedRoleId("");
      toast.success("Job posting created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create job posting: ${error.message}`);
    },
  });

  const deleteMutation = trpc.jobPostings.delete.useMutation({
    onSuccess: () => {
      utils.jobPostings.list.invalidate();
      utils.analytics.invalidate();
      toast.success("Job posting deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dailySpendDollars = parseFloat(formData.get("dailySpend") as string);
    const dailySpendCents = Math.round(dailySpendDollars * 100);
    
    createMutation.mutate({
      roleId: parseInt(selectedRoleId),
      jobTitle: formData.get("jobTitle") as string,
      location: formData.get("location") as string,
      dailySpend: dailySpendCents,
      startDate: formData.get("startDate") as string,
      status: (formData.get("status") as any) || 'active',
      totalApplicants: parseInt(formData.get("totalApplicants") as string) || 0,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleDelete = (id: number, jobTitle: string) => {
    if (confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const getRoleName = (roleId: number) => {
    return roles?.find(r => r.id === roleId)?.roleName || `Role #${roleId}`;
  };

  const getDaysActive = (startDate: Date) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalCost = (dailySpend: number, startDate: Date) => {
    return (dailySpend * getDaysActive(startDate)) / 100;
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ads Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track job posting ad spending and performance
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Job Posting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
                <DialogDescription>
                  Add a new job posting to track
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleId">Role *</Label>
                      <Select value={selectedRoleId} onValueChange={setSelectedRoleId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.roleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(!roles || roles.length === 0) && (
                        <p className="text-xs text-muted-foreground">
                          No roles found. Create roles first from the Roles page.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input 
                        id="jobTitle" 
                        name="jobTitle" 
                        placeholder="e.g., Amazon Account Manager +$8" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        placeholder="e.g., Pakistan" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dailySpend">Daily Spend ($) *</Label>
                      <Input 
                        id="dailySpend" 
                        name="dailySpend" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="25.00" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input 
                        id="startDate" 
                        name="startDate" 
                        type="date" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="active">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalApplicants">Initial Applicants</Label>
                      <Input 
                        id="totalApplicants" 
                        name="totalApplicants" 
                        type="number" 
                        min="0" 
                        defaultValue="0" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      placeholder="Any additional notes..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || !selectedRoleId}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Job Posting
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    ${((stats?.totalSpending || 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all positions
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalApplicants || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total applications received
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost Per Applicant</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    ${stats?.avgCostPerApplicant ? (stats.avgCostPerApplicant / 100).toFixed(2) : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall CPA
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Postings</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalPostings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active & closed
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Analytics and All Postings */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="postings">All Postings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            {/* By Role */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Spending by Role</CardTitle>
                <CardDescription>
                  Aggregated metrics across all job title variants for each role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roleLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !byRole || byRole.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available. Create job postings to see analytics.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Postings</TableHead>
                          <TableHead>Total Spending</TableHead>
                          <TableHead>Total Applicants</TableHead>
                          <TableHead>Cost Per Applicant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {byRole.map((role) => (
                          <TableRow key={role.roleId}>
                            <TableCell className="font-medium">{role.roleName}</TableCell>
                            <TableCell>{role.postingCount}</TableCell>
                            <TableCell>${((role.totalSpending || 0) / 100).toFixed(2)}</TableCell>
                            <TableCell>{role.totalApplicants}</TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              {role.avgCostPerApplicant 
                                ? `$${(role.avgCostPerApplicant / 100).toFixed(2)}`
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By Location */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Spending by Location</CardTitle>
                <CardDescription>
                  Total spending per geographic location
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locationLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !byLocation || byLocation.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Location</TableHead>
                          <TableHead>Postings</TableHead>
                          <TableHead>Total Spending</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {byLocation.map((loc, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{loc.location}</TableCell>
                            <TableCell>{loc.postingCount}</TableCell>
                            <TableCell>${((loc.totalSpending || 0) / 100).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="postings">
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>All Job Postings</CardTitle>
                <CardDescription>
                  Complete list of all job postings with calculated metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !jobPostings || jobPostings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No job postings found. Click "Add Job Posting" to create your first posting.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Daily Spend</TableHead>
                          <TableHead>Days Active</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead>CPA</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobPostings.map((posting) => {
                          const daysActive = getDaysActive(posting.startDate);
                          const totalCost = getTotalCost(posting.dailySpend, posting.startDate);
                          const cpa = posting.totalApplicants > 0 ? totalCost / posting.totalApplicants : null;
                          
                          return (
                            <TableRow key={posting.id}>
                              <TableCell className="font-medium">{getRoleName(posting.roleId)}</TableCell>
                              <TableCell>{posting.jobTitle}</TableCell>
                              <TableCell>{posting.location}</TableCell>
                              <TableCell>${(posting.dailySpend / 100).toFixed(2)}</TableCell>
                              <TableCell>{daysActive}</TableCell>
                              <TableCell>${totalCost.toFixed(2)}</TableCell>
                              <TableCell>{posting.totalApplicants}</TableCell>
                              <TableCell className="text-green-600 font-semibold">
                                {cpa ? `$${cpa.toFixed(2)}` : '-'}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  posting.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  posting.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {posting.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDelete(posting.id, posting.jobTitle)}
                                  disabled={deleteMutation.isPending}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
