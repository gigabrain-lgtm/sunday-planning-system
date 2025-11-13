import { Sidebar } from "@/components/layout/Sidebar";
import { Users } from "lucide-react";

export default function Hiring() {
  return (
    <Sidebar>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Users className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hiring</h1>
            <p className="text-gray-500 mt-1">Manage job postings and candidates</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Hiring System Coming Soon
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            This page is ready for the hiring system integration. 
            Follow the instructions in <code className="bg-white px-2 py-1 rounded">HIRING_SYSTEM_INTEGRATION.md</code> to add your hiring features here.
          </p>
        </div>
      </div>
    </Sidebar>
  );
}
