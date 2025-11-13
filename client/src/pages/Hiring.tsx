import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Plus, Users, Briefcase, Target } from "lucide-react";
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/hiring/recruiter-management">
            <Button className="w-full h-24 text-lg" variant="outline">
              <Users className="mr-2 h-5 w-5" />
              Recruiter Management
            </Button>
          </Link>
          
          <Link href="/hiring/jobs">
            <Button className="w-full h-24 text-lg" variant="outline">
              <Briefcase className="mr-2 h-5 w-5" />
              Jobs
            </Button>
          </Link>
          
          <Link href="/hiring/priorities">
            <Button className="w-full h-24 text-lg" variant="outline">
              <Target className="mr-2 h-5 w-5" />
              Hiring Priorities
            </Button>
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}
