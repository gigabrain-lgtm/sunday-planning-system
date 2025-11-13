import HiringDashboardLayout from "@/components/HiringDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Check, X, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const JOB_TITLES = [
  "Executive Assistant",
  "Appointment Setter",
  "Amazon PPC Strategist",
  "Amazon Account Manager",
  "Graphic Designer",
  "Senior Amazon Account Manager",
  "Brand Manager",
  "Closer",
  "Personal Assistant",
];

export default function JobCoverageMatrix() {
  const { data: jobAssignments, isLoading: assignmentsLoading } = trpc.jobAssignments.list.useQuery();
  const { data: recruiters, isLoading: recruitersLoading } = trpc.recruiters.list.useQuery();
  const [selectedCell, setSelectedCell] = useState<{ recruiterId: number; jobTitle: string; recruiterName: string } | null>(null);
  const [formData, setFormData] = useState({
    agencyName: "",
    cultureIndexInternalLink: "",
    cultureIndexAssessmentLink: "",
    workableLink: "",
  });
  
  const utils = trpc.useUtils();
  const createJobMutation = trpc.jobAssignments.create.useMutation({
    onSuccess: () => {
      toast.success("Job assignment created successfully!");
      utils.jobAssignments.list.invalidate();
      setSelectedCell(null);
      setFormData({
        agencyName: "",
        cultureIndexInternalLink: "",
        cultureIndexAssessmentLink: "",
        workableLink: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to create job assignment: ${error.message}`);
    },
  });
  
  const updateJobMutation = trpc.jobAssignments.update.useMutation({
    onSuccess: () => {
      toast.success("Job assignment updated successfully!");
      utils.jobAssignments.list.invalidate();
      setSelectedCell(null);
    },
    onError: (error) => {
      toast.error(`Failed to update job assignment: ${error.message}`);
    },
  });
  
  // Build coverage matrix
  const buildCoverageMatrix = () => {
    if (!recruiters || !jobAssignments) return [];
    
    return recruiters.map(recruiter => {
      const coverage: Record<string, any> = {};
      JOB_TITLES.forEach(jobTitle => {
        const job = jobAssignments.find(
          j => j.recruiterId === recruiter.id && j.jobTitle === jobTitle
        );
        coverage[jobTitle] = job || null;
      });
      return {
        recruiter,
        coverage,
        totalJobs: jobAssignments.filter(j => j.recruiterId === recruiter.id).length,
      };
    });
  };
  
  const getJobCoverageCount = (jobTitle: string) => {
    if (!jobAssignments) return 0;
    return jobAssignments.filter(j => j.jobTitle === jobTitle).length;
  };
  
  const getTotalCoverage = () => {
    if (!jobAssignments) return 0;
    return jobAssignments.length;
  };
  
  const handleCellClick = (recruiterId: number, jobTitle: string, recruiterName: string, existingJob: any) => {
    setSelectedCell({ recruiterId, jobTitle, recruiterName });
    if (existingJob) {
      setFormData({
        agencyName: existingJob.agencyName || recruiterName,
        cultureIndexInternalLink: existingJob.cultureIndexInternalLink || "",
        cultureIndexAssessmentLink: existingJob.cultureIndexAssessmentLink || "",
        workableLink: existingJob.workableLink || "",
      });
    } else {
      setFormData({
        agencyName: recruiterName,
        cultureIndexInternalLink: "",
        cultureIndexAssessmentLink: "",
        workableLink: "",
      });
    }
  };
  
  const handleSubmit = () => {
    if (!selectedCell) return;
    
    const existingJob = jobAssignments?.find(
      j => j.recruiterId === selectedCell.recruiterId && j.jobTitle === selectedCell.jobTitle
    );
    
    if (existingJob) {
      updateJobMutation.mutate({
        id: existingJob.id,
        cultureIndexInternalLink: formData.cultureIndexInternalLink || undefined,
        cultureIndexAssessmentLink: formData.cultureIndexAssessmentLink || undefined,
        workableLink: formData.workableLink || undefined,
      });
    } else {
      createJobMutation.mutate({
        recruiterId: selectedCell.recruiterId,
        jobTitle: selectedCell.jobTitle,
        agencyName: formData.agencyName,
      });
    }
  };
  
  if (assignmentsLoading || recruitersLoading) {
    return (
      <HiringDashboardLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </HiringDashboardLayout>
    );
  }
  
  const coverageMatrix = buildCoverageMatrix();
  const existingJob = selectedCell && jobAssignments?.find(
    j => j.recruiterId === selectedCell.recruiterId && j.jobTitle === selectedCell.jobTitle
  );
  
  return (
    <HiringDashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Job Coverage Matrix</h1>
          <p className="text-muted-foreground mt-2">
            Visual overview of which recruiters are assigned to which jobs. Click any cell to add or edit job details.
          </p>
        </div>
        
        {/* Summary Stats */}
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
              <CardTitle>Total Job Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{JOB_TITLES.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getTotalCoverage()}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coverage Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage Matrix</CardTitle>
            <CardDescription>
              Click any cell to add or edit job assignment details (Culture Index, Workable links, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header Row */}
                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `200px repeat(${JOB_TITLES.length}, 140px)` }}>
                  <div className="font-semibold text-sm p-2 bg-muted rounded">
                    Agency / Recruiter
                  </div>
                  {JOB_TITLES.map(jobTitle => (
                    <div key={jobTitle} className="text-xs font-medium p-2 bg-muted rounded text-center">
                      <div className="truncate" title={jobTitle}>{jobTitle}</div>
                      <div className="text-muted-foreground mt-1">
                        ({getJobCoverageCount(jobTitle)})
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Data Rows */}
                {coverageMatrix.map(({ recruiter, coverage, totalJobs }) => (
                  <div 
                    key={recruiter.id} 
                    className="grid gap-2 mb-2 hover:bg-muted/30 rounded transition-colors"
                    style={{ gridTemplateColumns: `200px repeat(${JOB_TITLES.length}, 140px)` }}
                  >
                    <div className="p-3 flex items-center justify-between border rounded">
                      <div>
                        <div className="font-medium">{recruiter.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'}
                        </div>
                      </div>
                      <Badge variant={recruiter.status === 'active' ? 'default' : 'secondary'}>
                        {recruiter.status}
                      </Badge>
                    </div>
                    
                    {JOB_TITLES.map(jobTitle => {
                      const job = coverage[jobTitle];
                      const hasJob = !!job;
                      return (
                        <button
                          key={jobTitle}
                          onClick={() => handleCellClick(recruiter.id, jobTitle, recruiter.name, job)}
                          className={`p-3 border rounded flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                            hasJob
                              ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                              : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          {hasJob ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Plus className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
                
                {/* Total Row */}
                <div 
                  className="grid gap-2 mt-4 pt-4 border-t"
                  style={{ gridTemplateColumns: `200px repeat(${JOB_TITLES.length}, 140px)` }}
                >
                  <div className="p-3 font-bold bg-muted rounded">
                    Total Coverage
                  </div>
                  {JOB_TITLES.map(jobTitle => {
                    const count = getJobCoverageCount(jobTitle);
                    return (
                      <div 
                        key={jobTitle} 
                        className={`p-3 rounded flex items-center justify-center font-semibold ${
                          count > 0 
                            ? 'bg-green-500/20 text-green-700' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {count}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-6 border-t flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/10 border border-green-500/30 rounded flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span>Assigned (click to edit)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-muted/30 border rounded flex items-center justify-center">
                  <Plus className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <span>Not Assigned (click to add)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Job Detail Dialog */}
      <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {existingJob ? 'Edit' : 'Add'} Job Assignment
            </DialogTitle>
            <DialogDescription>
              {existingJob ? 'Update' : 'Create'} job assignment for {selectedCell?.recruiterName} - {selectedCell?.jobTitle}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="e.g., GigaBrands"
                disabled={!!existingJob}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cultureIndexLink">Culture Index Internal Link</Label>
              <Input
                id="cultureIndexLink"
                value={formData.cultureIndexInternalLink}
                onChange={(e) => setFormData({ ...formData, cultureIndexInternalLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cultureIndexAssessmentLink">Culture Index Assessment Link</Label>
              <Input
                id="cultureIndexAssessmentLink"
                value={formData.cultureIndexAssessmentLink}
                onChange={(e) => setFormData({ ...formData, cultureIndexAssessmentLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workableLink">Workable Link</Label>
              <Input
                id="workableLink"
                value={formData.workableLink}
                onChange={(e) => setFormData({ ...formData, workableLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            {existingJob && (
              <div className="text-sm text-muted-foreground">
                <p><strong>Nomenclature:</strong> {existingJob.nomenclature}</p>
                <p><strong>Status:</strong> {existingJob.status}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedCell(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createJobMutation.isPending || updateJobMutation.isPending}
            >
              {createJobMutation.isPending || updateJobMutation.isPending ? 'Saving...' : existingJob ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </HiringDashboardLayout>
  );
}
