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
import { Link } from "wouter";
import { UserPlus, ExternalLink, Plus, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const JOB_TITLES = [
  "Executive Assistant",
  "Appointment Setter",
  "Amazon PPC Strategist",
  "Software Developer",
  "Amazon Account Manager",
  "Graphic Designer",
  "Senior Amazon Account Manager",
  "Brand Manager",
  "Phone Setters",
  "Closer",
  "Personal Assistant",
];

export default function RecruiterManagement() {
  const [expandedRecruiter, setExpandedRecruiter] = useState<number | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; recruiter: any | null }>({ open: false, recruiter: null });
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editSlack, setEditSlack] = useState("");
  const [addJobDialog, setAddJobDialog] = useState<{ open: boolean; recruiterId: number | null; recruiterName: string }>({ open: false, recruiterId: null, recruiterName: "" });
  const [jobTitle, setJobTitle] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [cultureIndexInternalLink, setCultureIndexInternalLink] = useState("");
  const [cultureIndexAssessmentLink, setCultureIndexAssessmentLink] = useState("");
  const [workableLink, setWorkableLink] = useState("");
  
  const { data: recruiters, isLoading: recruitersLoading } = trpc.recruiters.list.useQuery();
  const { data: jobAssignments, isLoading: assignmentsLoading } = trpc.jobAssignments.list.useQuery();
  const utils = trpc.useUtils();
  
  const createJobAssignment = trpc.jobAssignments.create.useMutation({
    onSuccess: () => {
      utils.jobAssignments.list.invalidate();
      toast.success("Job assigned successfully");
      setAddJobDialog({ open: false, recruiterId: null, recruiterName: "" });
      setJobTitle("");
      setAgencyName("");
      setCultureIndexInternalLink("");
      setCultureIndexAssessmentLink("");
      setWorkableLink("");
    },
    onError: (error) => {
      toast.error(`Failed to assign job: ${error.message}`);
    },
  });
  
  const updateRecruiter = trpc.recruiters.update.useMutation({
    onSuccess: () => {
      utils.recruiters.list.invalidate();
      toast.success("Recruiter updated successfully");
      setEditDialog({ open: false, recruiter: null });
    },
    onError: (error: any) => {
      toast.error(`Failed to update recruiter: ${error.message}`);
    },
  });
  
  const handleAddJob = () => {
    if (!addJobDialog.recruiterId || !jobTitle || !agencyName) {
      toast.error("Please fill in all fields");
      return;
    }
    
    createJobAssignment.mutate({
      recruiterId: addJobDialog.recruiterId,
      jobTitle,
      agencyName,
      cultureIndexInternalLink: cultureIndexInternalLink || undefined,
      cultureIndexAssessmentLink: cultureIndexAssessmentLink || undefined,
      workableLink: workableLink || undefined,
    });
  };
  
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
  
  const getRecruiterJobCount = (recruiterId: number) => {
    return jobAssignments?.filter(j => j.recruiterId === recruiterId).length || 0;
  };
  
  const getRecruiterCompletedCount = (recruiterId: number) => {
    return jobAssignments?.filter(j => j.recruiterId === recruiterId && j.status === 'completed').length || 0;
  };
  
  const getRecruiterJobs = (recruiterId: number) => {
    return jobAssignments?.filter(j => j.recruiterId === recruiterId) || [];
  };
  
  if (recruitersLoading || assignmentsLoading) {
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
            <h1 className="text-3xl font-bold">Recruiter Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage recruiters and their job assignments
            </p>
          </div>
          <Link href="/recruiter-onboarding">
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Recruiter
            </Button>
          </Link>
        </div>
        
        {/* Recruiters Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Recruiters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recruiters?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Job Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobAssignments?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Completed Setups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobAssignments?.filter(j => j.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recruiters Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recruiters</CardTitle>
            <CardDescription>All recruiters and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {!recruiters || recruiters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recruiters found. Add your first recruiter to get started.</p>
                <Link href="/recruiter-onboarding">
                  <Button className="mt-4">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Recruiter
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Slack Channel</TableHead>
                    <TableHead>Job Assignments</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recruiters.map((recruiter) => {
                    const isExpanded = expandedRecruiter === recruiter.id;
                    const recruiterJobs = getRecruiterJobs(recruiter.id);
                    
                    return (
                      <React.Fragment key={recruiter.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedRecruiter(isExpanded ? null : recruiter.id)}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {recruiter.name}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {recruiter.recruiterCode}
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {recruiter.slackChannelId}
                            </code>
                          </TableCell>
                          <TableCell>{getRecruiterJobCount(recruiter.id)}</TableCell>
                          <TableCell>{getRecruiterCompletedCount(recruiter.id)}</TableCell>
                          <TableCell>
                            <Badge variant={recruiter.status === 'active' ? 'default' : 'secondary'}>
                              {recruiter.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditDialog({ open: true, recruiter })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  window.location.href = `/recruiter-onboarding?recruiterId=${recruiter.id}`;
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Create Jobs
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Job List */}
                        {isExpanded && recruiterJobs.length > 0 && (
                          <TableRow key={`${recruiter.id}-expanded`}>
                            <TableCell colSpan={7} className="bg-muted/30 p-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm mb-3">Assigned Jobs:</h4>
                                {recruiterJobs.map((job) => (
                                  <div key={job.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                    <div className="flex-1">
                                      <div className="font-medium">{job.nomenclature}</div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {job.jobTitle} • {job.agencyName}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {getStatusBadge(job.status)}
                                      <div className="flex gap-2">
                                        {job.cultureIndexInternalLink && (
                                          <a
                                            href={job.cultureIndexInternalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                          >
                                            CI
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
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Add Job Dialog */}
        <Dialog open={addJobDialog.open} onOpenChange={(open) => setAddJobDialog({ open, recruiterId: addJobDialog.recruiterId, recruiterName: addJobDialog.recruiterName })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Job Assignment</DialogTitle>
              <DialogDescription>
                Assign a new job to {recruiters?.find(r => r.id === addJobDialog.recruiterId)?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input
                  id="agencyName"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g., Kurtis"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cultureIndexInternal">Culture Index Internal Link</Label>
                <Input
                  id="cultureIndexInternal"
                  value={cultureIndexInternalLink}
                  onChange={(e) => setCultureIndexInternalLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cultureIndexAssessment">Culture Index Assessment Link</Label>
                <Input
                  id="cultureIndexAssessment"
                  value={cultureIndexAssessmentLink}
                  onChange={(e) => setCultureIndexAssessmentLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workable">Workable Link</Label>
                <Input
                  id="workable"
                  value={workableLink}
                  onChange={(e) => setWorkableLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddJobDialog({ open: false, recruiterId: null, recruiterName: "" })}>
                Cancel
              </Button>
              <Button onClick={handleAddJob} disabled={createJobAssignment.isPending}>
                {createJobAssignment.isPending ? "Adding..." : "Add Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Recruiter Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => {
          if (!open) {
            setEditDialog({ open: false, recruiter: null });
            setEditName("");
            setEditCode("");
            setEditSlack("");
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Recruiter</DialogTitle>
              <DialogDescription>
                Update recruiter information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Recruiter Name</Label>
                <Input
                  id="editName"
                  value={editName || editDialog.recruiter?.name || ""}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Katia, Stealth"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editCode">Recruiter Code</Label>
                <Input
                  id="editCode"
                  value={editCode || editDialog.recruiter?.recruiterCode || ""}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  placeholder="e.g., KA001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editSlack">Slack Channel ID</Label>
                <Input
                  id="editSlack"
                  value={editSlack || editDialog.recruiter?.slackChannelId || ""}
                  onChange={(e) => setEditSlack(e.target.value)}
                  placeholder="e.g., C09R24WG3FV"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditDialog({ open: false, recruiter: null });
                setEditName("");
                setEditCode("");
                setEditSlack("");
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (!editDialog.recruiter) return;
                updateRecruiter.mutate({
                  id: editDialog.recruiter.id,
                  name: editName || editDialog.recruiter.name,
                  recruiterCode: editCode || editDialog.recruiter.recruiterCode,
                  slackChannelId: editSlack || editDialog.recruiter.slackChannelId,
                });
              }} disabled={updateRecruiter.isPending}>
                {updateRecruiter.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
