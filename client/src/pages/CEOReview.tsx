import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import HiringDashboardLayout from "@/components/HiringDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ExternalLink, Users, UserCheck } from "lucide-react";
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
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  const { data: candidates, isLoading, refetch } = trpc.hiring.workable.getCEOReviewCandidates.useQuery(
    undefined,
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

  return (
    <HiringDashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">CEO Review</h1>
            <p className="text-gray-500 mt-1">Candidates awaiting CEO approval</p>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Candidates</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCandidates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Roles</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueRoles.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-64">
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
        </div>

        {/* Candidates List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-4">Loading candidates...</p>
              </CardContent>
            </Card>
          ) : !shouldFetch ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Click "Refresh" to load CEO Review candidates</p>
              </CardContent>
            </Card>
          ) : filteredCandidates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No candidates found</p>
              </CardContent>
            </Card>
          ) : (
            filteredCandidates.map((candidate: Candidate) => (
              <Card key={candidate.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{candidate.name}</CardTitle>
                      <CardDescription>
                        {candidate.email || "No email"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={candidate.workableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in Workable
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Job Title:</span>
                      <p className="font-medium">{candidate.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <p className="font-medium">{candidate.source}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Applied:</span>
                      <p className="font-medium">{formatDate(candidate.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Technical Interviewer:</span>
                      <p className="font-medium">{candidate.technicalInterviewer || "Not assigned"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Final Interviewer:</span>
                      <p className="font-medium">{candidate.finalInterviewer || "Not assigned"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </HiringDashboardLayout>
  );
}
