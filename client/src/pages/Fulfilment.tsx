import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Fulfilment() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Fulfilment</h1>
              </div>
              <p className="text-gray-600">
                Fulfilment application will be integrated here
              </p>
            </div>

            {/* Placeholder Content */}
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  The fulfilment application will be integrated into this section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This page is a placeholder for the fulfilment application integration.
                  Follow the integration guide in FULFILMENT_INTEGRATION.md to install
                  the fulfilment application into this system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
