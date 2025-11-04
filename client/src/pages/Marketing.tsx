import { Sidebar } from "@/components/layout/Sidebar";

export default function Marketing() {
  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1800px] mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
            <p className="text-gray-600 mt-2">
              View and manage marketing data
            </p>
          </div>

          {/* Airtable Iframe Container */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
            <iframe
              src="https://airtable.com/embed/appqEHlOpXL0WUbuf/pagdxgt0XS4QjzBBB"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Marketing Airtable"
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
