import { Sidebar } from "@/components/layout/Sidebar";
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
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Briefcase, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapWorkableJobDialog } from "@/components/MapWorkableJobDialog";

export default function WorkableJobs() {
  const [syncing, setSyncing] = useState(false);
  const [mappingJob, setMappingJob] = useState<{ id: string; title: string; shortcode: string } | null>(null);
  
  const syncMutation = trpc.workable.syncAllJobs.useMutation({
    onSuccess: (data) => {
      toast.success(`Synced ${data.jobs.length} jobs from Workable`);
      setSyncing(false);
    },
    onError: (error) => {
      toast.error(`Failed to sync: ${error.message}`);
      setSyncing(false);
    },
  });
  
  // Add timeout for long-running requests
  useEffect(() => {
    if (syncing) {
      const timeout = setTimeout(() => {
        if (syncMutation.isPending) {
          toast.error("Request timed out. Fetching candidates can take 30-60 seconds.");
          setSyncing(false);
        }
      }, 60000); // 60 second timeout
      return () => clearTimeout(timeout);
    }
  }, [syncing, syncMutation.isPending]);
  
  const workableJobs = syncMutation.data;
  const isLoading = syncMutation.isPending;
  
  // Trigger initial load (use cached data for faster response)
  const handleSync = () => {
    setSyncing(true);
    syncMutation.mutate({ forceRefresh: false }); // Use cache to avoid slow API calls
  };
  
  if (isLoading) {
    return (
      <Sidebar>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Sidebar>
    );
  }
  
  const jobs = workableJobs?.jobs || [];
  const totalApplicants = jobs.reduce((sum, job) => sum + job.totalCandidates, 0);
  
  return (
    <Sidebar>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workable Jobs</h1>
            <p className="text-muted-foreground mt-2">
              Active job postings from Workable with applicant metrics
            </p>
          </div>
          <Button 
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Syncing..." : "Refresh Data"}
          </Button>
        </div>
        
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Applicants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApplicants}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobs.reduce((sum, job) => {
                  const linkedinCount = Object.values(job.metrics.linkedin_ads || {}).reduce((a: number, b: any) => a + (b as number), 0);
                  return sum + linkedinCount;
                }, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Headhunting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobs.reduce((sum, job) => {
                  const headhuntingCount = Object.values(job.metrics.headhunting || {}).reduce((a: number, b: any) => a + (b as number), 0);
                  return sum + headhuntingCount;
                }, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Job Performance</CardTitle>
            <CardDescription>Applicant metrics and cost analysis for each Workable job</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Workable jobs found</p>
                <p className="text-sm mt-2">Click "Refresh Data" to sync jobs from Workable</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Shortcode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Applicants</TableHead>
                      <TableHead className="text-right">LinkedIn Ads</TableHead>
                      <TableHead className="text-right">Headhunting</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => {
                      const linkedinCount = Object.values(job.metrics.linkedin_ads || {}).reduce((a: number, b: any) => a + (b as number), 0);
                      const headhuntingCount = Object.values(job.metrics.headhunting || {}).reduce((a: number, b: any) => a + (b as number), 0);
                      
                      return (
                        <TableRow key={job.jobShortcode}>
                          <TableCell className="font-medium">{job.jobTitle}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{job.jobShortcode}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.jobState === 'published' ? 'default' : 'secondary'}>
                              {job.jobState}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{job.totalCandidates}</TableCell>
                          <TableCell className="text-right">{linkedinCount}</TableCell>
                          <TableCell className="text-right">{headhuntingCount}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setMappingJob({
                                id: job.jobId,
                                title: job.jobTitle,
                                shortcode: job.jobShortcode,
                              })}
                            >
                              <LinkIcon className="h-4 w-4 mr-1" />
                              Map to Job
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
      </div>
      
      {/* Mapping Dialog */}
      {mappingJob && (
        <MapWorkableJobDialog
          open={!!mappingJob}
          onOpenChange={(open) => !open && setMappingJob(null)}
          workableJob={mappingJob}
          onSuccess={() => {
            // Refresh the data after successful mapping
            handleSync();
          }}
        />
      )}
    </Sidebar>
  );
}
