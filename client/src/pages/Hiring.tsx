import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Plus, Users, Briefcase, Target, TrendingUp, UserCheck, GitBranch, Grid3x3, FileText, DollarSign, UserPlus, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Hiring() {
  const { data: recruiters } = trpc.hiring.recruiters.list.useQuery();
  const { data: jobAssignments } = trpc.hiring.jobAssignments.list.useQuery();
  const { data: priorities } = trpc.hiring.priorities.list.useQuery();

  return (
    <Sidebar>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hiring System</h1>
            <p className="text-gray-500 mt-1">Manage recruiters, jobs, and priorities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recruiters</p>
                <p className="text-3xl font-bold mt-1">{recruiters?.length || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Job Assignments</p>
                <p className="text-3xl font-bold mt-1">{jobAssignments?.length || 0}</p>
              </div>
              <Briefcase className="h-10 w-10 text-green-500" />
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hiring Priorities</p>
                <p className="text-3xl font-bold mt-1">{priorities?.length || 0}</p>
              </div>
              <Target className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* LinkedIn Ads Tracking Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📊 LinkedIn Ads Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/hiring/roles">
              <Button className="w-full h-20 text-base" variant="outline">
                <Briefcase className="mr-2 h-5 w-5" />
                Roles
              </Button>
            </Link>
            
            <Link href="/hiring/daily-reconciliation">
              <Button className="w-full h-20 text-base" variant="outline">
                <Calendar className="mr-2 h-5 w-5" />
                Daily Reconciliation
              </Button>
            </Link>
            
            <Link href="/hiring/invoices">
              <Button className="w-full h-20 text-base" variant="outline">
                <DollarSign className="mr-2 h-5 w-5" />
                Invoices
              </Button>
            </Link>
          </div>
        </div>

        {/* Recruitment Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">👥 Recruitment Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/hiring/recruiter-management">
              <Button className="w-full h-20 text-base" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Recruiter Management
              </Button>
            </Link>
            
            <Link href="/hiring/recruiter-onboarding">
              <Button className="w-full h-20 text-base" variant="outline">
                <UserPlus className="mr-2 h-5 w-5" />
                Recruiter Onboarding
              </Button>
            </Link>
            
            <Link href="/hiring/jobs">
              <Button className="w-full h-20 text-base" variant="outline">
                <Briefcase className="mr-2 h-5 w-5" />
                Jobs
              </Button>
            </Link>
            
            <Link href="/hiring/job-coverage">
              <Button className="w-full h-20 text-base" variant="outline">
                <Grid3x3 className="mr-2 h-5 w-5" />
                Job Coverage Matrix
              </Button>
            </Link>
          </div>
        </div>

        {/* Workable Integration Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🔗 Workable Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/hiring/recruitment-funnel">
              <Button className="w-full h-20 text-base" variant="outline">
                <GitBranch className="mr-2 h-5 w-5" />
                Recruitment Funnel
              </Button>
            </Link>
            
            <Link href="/hiring/ceo-review">
              <Button className="w-full h-20 text-base" variant="outline">
                <UserCheck className="mr-2 h-5 w-5" />
                CEO Review
              </Button>
            </Link>
            
            <Link href="/hiring/workable-jobs">
              <Button className="w-full h-20 text-base" variant="outline">
                <FileText className="mr-2 h-5 w-5" />
                Workable Jobs
              </Button>
            </Link>
            
            <Link href="/hiring/priorities">
              <Button className="w-full h-20 text-base" variant="outline">
                <Target className="mr-2 h-5 w-5" />
                Hiring Priorities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
