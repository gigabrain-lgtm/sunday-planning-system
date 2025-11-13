import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Briefcase, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function Jobs() {
  const [editDialog, setEditDialog] = useState<{ open: boolean; job: any | null }>({ open: false, job: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; job: any | null }>({ open: false, job: null });
  const [editForm, setEditForm] = useState({ cultureIndexInternalLink: "", cultureIndexAssessmentLink: "", workableLink: "" });
  const [syncing, setSyncing] = useState(false);
  
  const { data: jobAssignments, isLoading: assignmentsLoading } = trpc.hiring.jobAssignments.list.useQuery();
  const { data: recruiters, isLoading: recruitersLoading } = trpc.recruiters.list.useQuery();
  const utils = trpc.useUtils();
  
  const syncFromWorkable = trpc.hiring.jobAssignments.syncFromWorkable.useMutation({
    onSuccess: (data) => {
      utils.jobAssignments.list.invalidate();
      toast.success(`Synced ${data.created} new jobs from Workable (${data.skipped} skipped, ${data.total} total)`);
      setSyncing(false);
    },
    onError: (error) => {
      toast.error(`Failed to sync: ${error.message}`);
      setSyncing(false);
    },
  });
  
  const updateJobAssignment = trpc.hiring.jobAssignments.update.useMutation({
    onSuccess: () => {
      utils.jobAssignments.list.invalidate();
      toast.success("Job assignment updated successfully");
      setEditDialog({ open: false, job: null });
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
  
  const deleteJobAssignment = trpc.hiring.jobAssignments.delete.useMutation({
    onSuccess: () => {
      utils.jobAssignments.list.invalidate();
      toast.success("Job assignment deleted successfully");
      setDeleteDialog({ open: false, job: null });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      culture_index_pending: { label: "Culture Index Pending", variant: "default" as const },
      workable_pending: { label: "Workable Pending", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  
  const getRecruiterName = (recruiterId: number) => {
    const recruiter = recruiters?.find(r => r.id === recruiterId);
    return recruiter?.name || "Unknown";
  };
  
  if (assignmentsLoading || recruitersLoading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Jobs</h1>
            <p className="text-muted-foreground mt-2">
              Complete list of all job assignments across all recruiters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{jobAssignments?.length || 0}</span>
            <span className="text-muted-foreground">Total Jobs</span>
          </div>
        </div>
        
        {/* Jobs Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobAssignments?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobAssignments?.filter(j => j.status === 'draft').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobAssignments?.filter(j => j.status === 'culture_index_pending' || j.status === 'workable_pending').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobAssignments?.filter(j => j.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Job Assignments</CardTitle>
            <CardDescription>Complete list of jobs with recruiter assignments and status</CardDescription>
          </CardHeader>
          <CardContent>
            {!jobAssignments || jobAssignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No job assignments found</p>
                <p className="text-sm mt-2">Sync jobs from Workable to get started</p>
                <Button 
                  onClick={() => {
                    setSyncing(true);
                    syncFromWorkable.mutate();
                  }}
                  disabled={syncing}
                  className="mt-4"
                >
                  {syncing ? "Syncing..." : "Sync from Workable"}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomenclature</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Agency Name</TableHead>
                      <TableHead>Recruiter</TableHead>
                      <TableHead>Workable Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobAssignments.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          <div className="font-mono text-sm">{job.nomenclature}</div>
                        </TableCell>
                        <TableCell>{job.jobTitle}</TableCell>
                        <TableCell>{job.agencyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRecruiterName(job.recruiterId)}</Badge>
                        </TableCell>
                        <TableCell>
                          {job.workableJobId ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">{job.workableShortcode}</code>
                              <Badge variant="secondary" className="text-xs">Mapped</Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not mapped</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {job.cultureIndexInternalLink && (
                              <a
                                href={job.cultureIndexInternalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                              >
                                Culture Index
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {job.workableLink && (
                              <a
                                href={job.workableLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                              >
                                Workable
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {!job.cultureIndexInternalLink && !job.workableLink && (
                              <span className="text-xs text-muted-foreground">No links</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditForm({
                                  cultureIndexInternalLink: job.cultureIndexInternalLink || "",
                                  cultureIndexAssessmentLink: job.cultureIndexAssessmentLink || "",
                                  workableLink: job.workableLink || "",
                                });
                                setEditDialog({ open: true, job });
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, job })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Job Assignment Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, job: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job Assignment</DialogTitle>
            <DialogDescription>
              Update links for {editDialog.job?.nomenclature}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cultureIndexInternal">Culture Index Internal Link</Label>
              <Input
                id="cultureIndexInternal"
                value={editForm.cultureIndexInternalLink}
                onChange={(e) => setEditForm({ ...editForm, cultureIndexInternalLink: e.target.value })}
                placeholder="https://portal.cultureindex.com/..."
              />
            </div>
            
            <div>
              <Label htmlFor="cultureIndexAssessment">Culture Index Assessment Link</Label>
              <Input
                id="cultureIndexAssessment"
                value={editForm.cultureIndexAssessmentLink}
                onChange={(e) => setEditForm({ ...editForm, cultureIndexAssessmentLink: e.target.value })}
                placeholder="https://go.cultureindex.com/p/..."
              />
            </div>
            
            <div>
              <Label htmlFor="workable">Workable Link</Label>
              <Input
                id="workable"
                value={editForm.workableLink}
                onChange={(e) => setEditForm({ ...editForm, workableLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, job: null })}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!editDialog.job) return;
                
                // Determine new status based on links
                let newStatus: 'draft' | 'culture_index_pending' | 'workable_pending' | 'completed' = 'draft';
                if (editForm.cultureIndexInternalLink && editForm.cultureIndexAssessmentLink && editForm.workableLink) {
                  newStatus = 'completed';
                } else if (editForm.cultureIndexInternalLink || editForm.cultureIndexAssessmentLink) {
                  newStatus = 'culture_index_pending';
                }
                
                updateJobAssignment.mutate({
                  id: editDialog.job.id,
                  cultureIndexInternalLink: editForm.cultureIndexInternalLink || undefined,
                  cultureIndexAssessmentLink: editForm.cultureIndexAssessmentLink || undefined,
                  workableLink: editForm.workableLink || undefined,
                  status: newStatus,
                });
              }}
              disabled={updateJobAssignment.isPending}
            >
              {updateJobAssignment.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, job: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.job && (
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Job:</span> {deleteDialog.job.jobTitle}</p>
                <p><span className="font-medium">Nomenclature:</span> {deleteDialog.job.nomenclature}</p>
                <p><span className="font-medium">Recruiter:</span> {getRecruiterName(deleteDialog.job.recruiterId)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, job: null })}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteDialog.job) {
                  deleteJobAssignment.mutate({ id: deleteDialog.job.id });
                }
              }}
              disabled={deleteJobAssignment.isPending}
            >
              {deleteJobAssignment.isPending ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
