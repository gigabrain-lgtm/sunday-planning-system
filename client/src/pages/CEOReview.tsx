import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ExternalLink, Users, UserCheck, UserX, Briefcase, Archive, Filter } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  email: string | null;
  jobTitle: string;
  jobShortcode: string;
  source: string;
  createdAt: string;
  workableUrl: string;
  technicalInterviewer: string | null;
  finalInterviewer: string | null;
}

export default function CEOReview() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewingCandidateId, setViewingCandidateId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  const { data: candidates, isLoading, error, refetch } = trpc.workable.getCEOReviewCandidates.useQuery(
    { forceRefresh: false },
    { 
      enabled: shouldFetch,
      retry: false,
      staleTime: 300000,
    }
  );

  const handleRefresh = async () => {
    setShouldFetch(true);
    try {
      await refetch();
      toast.success("Refreshed CEO Review candidates");
    } catch (error: any) {
      toast.error(`Failed to refresh: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const scheduleInterviewMutation = trpc.workable.scheduleInterview.useMutation({
    onSuccess: () => {
      toast.success("Interview scheduled successfully");
      refetch();
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast.error(`Failed to schedule interview: ${error.message}`);
    },
  });

  const moveCandidateMutation = trpc.workable.moveCandidateToStage.useMutation({
    onSuccess: () => {
      toast.success("Candidate moved successfully");
      refetch();
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast.error(`Failed to move candidate: ${error.message}`);
    },
  });

  // Fetch comments and details for selected candidate
  const { data: candidateComments } = trpc.workable.getCandidateComments.useQuery(
    { candidateId: viewingCandidateId! },
    { enabled: !!viewingCandidateId }
  );

  const { data: candidateDetails } = trpc.workable.getCandidateDetails.useQuery(
    { candidateId: viewingCandidateId! },
    { enabled: !!viewingCandidateId }
  );

  // Extract unique roles from candidates
  const uniqueRoles = useMemo(() => {
    if (!candidates) return [];
    const roles = new Set(candidates.map((c: Candidate) => c.jobTitle));
    return Array.from(roles).sort();
  }, [candidates]);

  // Filter candidates by selected role
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    if (selectedRole === 'all') return candidates;
    return candidates.filter((c: Candidate) => c.jobTitle === selectedRole);
  }, [candidates, selectedRole]);

  const handleAction = (action: string, candidate: Candidate) => {
    switch (action) {
      case 'technical':
        if (candidate.technicalInterviewer) {
          scheduleInterviewMutation.mutate({
            candidateId: candidate.id,
            interviewerName: candidate.technicalInterviewer,
          });
        } else {
          toast.error("No technical interviewer assigned for this role");
        }
        break;
      
      case 'final':
        if (candidate.finalInterviewer) {
          scheduleInterviewMutation.mutate({
            candidateId: candidate.id,
            interviewerName: candidate.finalInterviewer,
          });
        } else {
          toast.error("No final interviewer assigned for this role");
        }
        break;
      
      case 'recruiting':
        // Move to recruiting stage (you may need to adjust the stage slug)
        moveCandidateMutation.mutate({
          candidateId: candidate.id,
          targetStage: 'recruiting',
        });
        break;
      
      case 'hire':
        moveCandidateMutation.mutate({
          candidateId: candidate.id,
          targetStage: 'hired',
        });
        break;
      
      case 'disqualified':
        moveCandidateMutation.mutate({
          candidateId: candidate.id,
          targetStage: 'disqualified',
        });
        break;
      
      case 'bench':
        // Move to bench/talent pool (you may need to adjust the stage slug)
        moveCandidateMutation.mutate({
          candidateId: candidate.id,
          targetStage: 'bench',
        });
        break;
      
      default:
        toast.error(`Unknown action: ${action}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">CEO Review Candidates</h1>
          <p className="text-muted-foreground">
            Review and approve candidates awaiting final decision
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[250px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Total Candidates Awaiting Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {isLoading ? '...' : filteredCandidates?.length || 0}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedRole === 'all' 
              ? 'Candidates in CEO Review stage'
              : `${selectedRole} candidates in CEO Review`
            }
          </p>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      {!shouldFetch && !candidates ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">No data loaded yet</p>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Go to <strong>Recruitment Funnel</strong> and click "Sync All from Workable" first, then return here to view CEO Review candidates.
                </p>
                <p className="text-xs text-muted-foreground">
                  Or click Refresh above if you've already synced recently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-destructive mb-2">Failed to load candidates</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {error.message || 'An error occurred while fetching CEO Review candidates'}
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading candidates...</span>
            </div>
          </CardContent>
        </Card>
      ) : !filteredCandidates || filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {selectedRole === 'all'
                ? 'No candidates in CEO Review stage'
                : `No ${selectedRole} candidates in CEO Review stage`
              }
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate: Candidate) => (
            <Card key={candidate.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  <a
                    href={candidate.workableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    {candidate.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </CardTitle>
                <CardDescription className="space-y-1">
                  <div className="text-sm">{candidate.jobTitle}</div>
                  <div className="text-xs text-muted-foreground">{candidate.email || 'No email'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={candidate.source === 'linkedin_ads' ? 'default' : 'secondary'} className="text-xs">
                      {candidate.source === 'linkedin_ads' ? 'LinkedIn Ads' : 'Headhunting'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(candidate.createdAt)}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Take Action
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setViewingCandidateId(candidate.id)}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Details & Comments
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <a
                    href={candidate.workableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Workable
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take Action</DialogTitle>
            <DialogDescription>
              Choose an action for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            {selectedCandidate?.technicalInterviewer && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleAction(`Set Interview with ${selectedCandidate.technicalInterviewer}`, selectedCandidate)}
              >
                <UserCheck className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Set Interview with {selectedCandidate.technicalInterviewer}</div>
                  <div className="text-xs text-muted-foreground">Technical Interview</div>
                </div>
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleAction('Set Interview with Recruiting', selectedCandidate!)}
            >
              <Users className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Set Interview with Recruiting</div>
                <div className="text-xs text-muted-foreground">Recruiting Team Review</div>
              </div>
            </Button>

            {selectedCandidate?.finalInterviewer && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleAction(`Set Interview with ${selectedCandidate.finalInterviewer}`, selectedCandidate)}
              >
                <UserCheck className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Set Interview with {selectedCandidate.finalInterviewer}</div>
                  <div className="text-xs text-muted-foreground">Final Interview</div>
                </div>
              </Button>
            )}

            <div className="border-t my-2" />

            <Button
              variant="default"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleAction('Hire', selectedCandidate!)}
            >
              <Briefcase className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Hire</div>
                <div className="text-xs opacity-80">Move to hired</div>
              </div>
            </Button>

            <Button
              variant="destructive"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleAction('Disqualified', selectedCandidate!)}
            >
              <UserX className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Disqualified</div>
                <div className="text-xs opacity-80">Reject candidate</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleAction('Move to bench', selectedCandidate!)}
            >
              <Archive className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Move to bench</div>
                <div className="text-xs text-muted-foreground">Save for future opportunities</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details & Comments Dialog */}
      <Dialog open={!!viewingCandidateId} onOpenChange={(open) => !open && setViewingCandidateId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>
              {candidateDetails?.name || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Resume Section */}
            {candidateDetails?.resumeUrl && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Resume</h3>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={candidateDetails.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
              </div>
            )}

            {/* Candidate Info */}
            {candidateDetails && (
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                {candidateDetails.email && (
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {candidateDetails.email}
                  </div>
                )}
                {candidateDetails.phone && (
                  <div className="text-sm">
                    <span className="font-medium">Phone:</span> {candidateDetails.phone}
                  </div>
                )}
                {candidateDetails.headline && (
                  <div className="text-sm">
                    <span className="font-medium">Headline:</span> {candidateDetails.headline}
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Comments & Notes</h3>
              {!candidateComments ? (
                <div className="text-sm text-muted-foreground">Loading comments...</div>
              ) : candidateComments.length === 0 ? (
                <div className="text-sm text-muted-foreground">No comments yet</div>
              ) : (
                <div className="space-y-3">
                  {candidateComments.map((comment: any) => (
                    <div key={comment.id} className="border-l-2 border-primary pl-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comment.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
