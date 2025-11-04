import { Sidebar } from "@/components/layout/Sidebar";

export default function Calendar() {
  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1800px] mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">
              View and manage your calendar schedule
            </p>
          </div>

          {/* Google Sheets Iframe Container */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
            <iframe
              src="https://docs.google.com/spreadsheets/d/16Tx-0eQZGqAQBUS2AhcBXnQdd1Z70SIS/edit?rm=minimal"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Calendar Spreadsheet"
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
