import { Sidebar } from "@/components/layout/Sidebar";

export default function Checkins() {
  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1800px] mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Weekly Check-ins</h1>
            <p className="text-gray-600 mt-2">
              Track and review your weekly check-in dashboard
            </p>
          </div>

          {/* Iframe Container */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
            <iframe
              src="https://plankton-app-6ikx5.ondigitalocean.app/dashboard"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Weekly Check-ins Dashboard"
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
