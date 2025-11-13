import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, StopCircle, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function DailyReconciliation() {
  const { data: jobPostings, isLoading } = trpc.jobPostings.listActive.useQuery();
  const { data: roles } = trpc.roles.list.useQuery();
  const utils = trpc.useUtils();

  const [applicantCounts, setApplicantCounts] = useState<Record<number, number>>({});
  const [editSpendDialog, setEditSpendDialog] = useState<{ open: boolean; jobId: number | null; currentSpend: number }>({
    open: false,
    jobId: null,
    currentSpend: 0,
  });
  const [newDailySpend, setNewDailySpend] = useState("");

  const bulkUpdateMutation = trpc.jobPostings.bulkUpdateApplicants.useMutation({
    onSuccess: () => {
      utils.jobPostings.listActive.invalidate();
      utils.analytics.invalidate();
      setApplicantCounts({});
      toast.success("Applicant counts updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const endJobMutation = trpc.jobPostings.endJob.useMutation({
    onSuccess: () => {
      utils.jobPostings.listActive.invalidate();
      utils.analytics.invalidate();
      toast.success("Job posting closed");
    },
    onError: (error) => {
      toast.error(`Failed to end job: ${error.message}`);
    },
  });

  const updateSpendMutation = trpc.jobPostings.updateDailySpend.useMutation({
    onSuccess: () => {
      utils.jobPostings.listActive.invalidate();
      utils.analytics.invalidate();
      setEditSpendDialog({ open: false, jobId: null, currentSpend: 0 });
      setNewDailySpend("");
      toast.success("Daily spend updated");
    },
    onError: (error) => {
      toast.error(`Failed to update spend: ${error.message}`);
    },
  });

  const handleApplicantChange = (id: number, value: string) => {
    const num = parseInt(value) || 0;
    setApplicantCounts(prev => ({ ...prev, [id]: num }));
  };

  const handleSave = () => {
    const updates = Object.entries(applicantCounts).map(([id, totalApplicants]) => ({
      id: parseInt(id),
      totalApplicants,
    }));

    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }

    bulkUpdateMutation.mutate(updates);
  };

  const handleEndJob = (id: number, jobTitle: string) => {
    if (!confirm(`Are you sure you want to end "${jobTitle}"? This will mark it as closed.`)) {
      return;
    }
    endJobMutation.mutate({ id });
  };

  const handleOpenEditSpend = (jobId: number, currentSpend: number) => {
    setEditSpendDialog({ open: true, jobId, currentSpend });
    setNewDailySpend((currentSpend / 100).toFixed(2));
  };

  const handleUpdateSpend = () => {
    if (!editSpendDialog.jobId) return;
    
    const spendInCents = Math.round(parseFloat(newDailySpend) * 100);
    if (isNaN(spendInCents) || spendInCents < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    updateSpendMutation.mutate({
      id: editSpendDialog.jobId,
      newDailySpend: spendInCents,
    });
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
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Reconciliation</h1>
          <p className="text-muted-foreground mt-2">
            Update applicant counts for all active job postings
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={bulkUpdateMutation.isPending || Object.keys(applicantCounts).length === 0}>
          {bulkUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Active Job Postings</CardTitle>
          <CardDescription>
            Enter today's total applicant count for each posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !jobPostings || jobPostings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active job postings found. Create job postings from the dashboard first.
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
                    <TableHead>Current Applicants</TableHead>
                    <TableHead>New Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((posting) => {
                    const daysActive = getDaysActive(posting.startDate);
                    const totalCost = getTotalCost(posting.dailySpend, posting.startDate);
                    
                    return (
                      <TableRow key={posting.id}>
                        <TableCell className="font-medium">{getRoleName(posting.roleId)}</TableCell>
                        <TableCell>{posting.jobTitle}</TableCell>
                        <TableCell>{posting.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            ${(posting.dailySpend / 100).toFixed(2)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditSpend(posting.id, posting.dailySpend)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{daysActive}</TableCell>
                        <TableCell>${totalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {posting.totalApplicants}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            placeholder={posting.totalApplicants.toString()}
                            value={applicantCounts[posting.id] ?? ""}
                            onChange={(e) => handleApplicantChange(posting.id, e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleEndJob(posting.id, posting.jobTitle)}
                            disabled={endJobMutation.isPending}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
                            End Job
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

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Daily Reconciliation Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Enter the <strong>total cumulative applicants</strong> (not just today's new applicants)</li>
          <li>• Days active and total cost are calculated automatically from the start date</li>
          <li>• Click the edit icon next to Daily Spend to update budget (keeps history)</li>
          <li>• Use "End Job" button to close a posting when it's no longer active</li>
          <li>• Only update the postings that have changes - leave others blank</li>
          <li>• Click "Save Changes" when done to update all modified postings at once</li>
        </ul>
      </div>

      {/* Edit Daily Spend Dialog */}
      <Dialog open={editSpendDialog.open} onOpenChange={(open) => setEditSpendDialog({ ...editSpendDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Spend</DialogTitle>
            <DialogDescription>
              Update the daily advertising spend for this job posting. Previous spend amounts are saved in history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentSpend">Current Daily Spend</Label>
              <Input
                id="currentSpend"
                value={`$${(editSpendDialog.currentSpend / 100).toFixed(2)}`}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newSpend">New Daily Spend ($)</Label>
              <Input
                id="newSpend"
                type="number"
                step="0.01"
                min="0"
                value={newDailySpend}
                onChange={(e) => setNewDailySpend(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSpendDialog({ open: false, jobId: null, currentSpend: 0 })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSpend} disabled={updateSpendMutation.isPending}>
              {updateSpendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Spend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DailyReconciliationPage() {
  return (
    <DashboardLayout>
      <DailyReconciliation />
    </DashboardLayout>
  );
}
