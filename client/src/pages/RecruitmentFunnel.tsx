import { useState, Fragment } from "react";
import { trpc } from "@/lib/trpc";
import HiringDashboardLayout from "@/components/HiringDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

export default function RecruitmentFunnel() {
  const [jobMetrics, setJobMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const syncAllJobsMutation = trpc.workable.syncAllJobs.useMutation();

  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      const result = await syncAllJobsMutation.mutateAsync({ forceRefresh: false });
      setJobMetrics(result.jobs);
      toast.success(`Synced ${result.jobs.length} jobs from Workable`);
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error(`Workable API error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stages = [
    { key: 'applied', label: 'Applied' },
    { key: 'ci_passed', label: 'CI Passed' },
    { key: 'screening_call', label: 'Screening Call' },
    { key: 'hr_interview', label: 'HR Interview' },
    { key: 'hr_conducted', label: 'HR Conducted' },
    { key: 'hr_passed', label: 'HR Passed' },
    { key: 'hiring_manager', label: 'Hiring Manager' },
    { key: 'ceo_review', label: 'CEO Review' },
  ];

  // Calculate totals
  const totalCandidates = jobMetrics.reduce((sum, job) => sum + job.totalCandidates, 0);
  const linkedinAdsTotal = jobMetrics.reduce((sum, job) => {
    const linkedinCount = Object.values(job.metrics.linkedin_ads || {}).reduce((s: number, c: any) => s + c, 0);
    return sum + linkedinCount;
  }, 0);
  const headhuntingTotal = jobMetrics.reduce((sum, job) => {
    const headhuntingCount = Object.values(job.metrics.headhunting || {}).reduce((s: number, c: any) => s + c, 0);
    return sum + headhuntingCount;
  }, 0);

  const getStageCount = (job: any, source: 'linkedin_ads' | 'headhunting', stageKey: string) => {
    return job.metrics[source]?.[stageKey] || 0;
  };

  return (
    <HiringDashboardLayout>
      <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Funnel</h1>
          <p className="text-muted-foreground">
            Track candidate progression through hiring stages
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSyncAll} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync All from Workable
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              Across all stages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LinkedIn Ads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkedinAdsTotal}</div>
            <p className="text-xs text-muted-foreground">
              From paid ads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Headhunting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{headhuntingTotal}</div>
            <p className="text-xs text-muted-foreground">
              Sourced candidates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recruitment Pipeline by Job</CardTitle>
          <CardDescription>
            Candidate counts at each stage, separated by source (LinkedIn Ads vs Headhunting)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Sync All from Workable" to load recruitment metrics
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Job Title</TableHead>
                    <TableHead>Source</TableHead>
                    {stages.map(stage => (
                      <TableHead key={stage.key} className="text-center">
                        {stage.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobMetrics.map((job) => (
                    <Fragment key={job.jobId}>
                      <TableRow>
                        <TableCell className="font-medium" rowSpan={2}>
                          {job.jobTitle}
                          <div className="text-xs text-muted-foreground">{job.jobState}</div>
                        </TableCell>
                        <TableCell className="text-xs">LinkedIn Ads</TableCell>
                        {stages.map(stage => (
                          <TableCell key={stage.key} className="text-center">
                            {getStageCount(job, 'linkedin_ads', stage.key) || '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">
                          {Object.values(job.metrics.linkedin_ads || {}).reduce((sum: number, count: any) => sum + count, 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Headhunting</TableCell>
                        {stages.map(stage => (
                          <TableCell key={stage.key} className="text-center">
                            {getStageCount(job, 'headhunting', stage.key) || '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">
                          {Object.values(job.metrics.headhunting || {}).reduce((sum: number, count: any) => sum + count, 0)}
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </HiringDashboardLayout>
  );
}
