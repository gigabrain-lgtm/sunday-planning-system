import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function FulfilmentDashboard() {
  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-950 p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Fulfilment Dashboard</h1>
          <p className="text-gray-400">
            Overview of your Amazon FBA operations and performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$491,094.93</div>
              <p className="text-xs text-gray-400">Across all sellers</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">100+</div>
              <p className="text-xs text-gray-400">In MRP inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Clients</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">20</div>
              <p className="text-xs text-gray-400">ClickUp clients</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Pending Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">-</div>
              <p className="text-xs text-gray-400">Creative tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest updates across your fulfilment operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">System deployed successfully</p>
                  <p className="text-xs text-gray-400">Fulfilment module is now live</p>
                </div>
                <p className="text-xs text-gray-400">Just now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-left transition-colors">
                <Package className="h-6 w-6 text-blue-400 mb-2" />
                <p className="font-medium text-gray-200">Check Inventory</p>
                <p className="text-xs text-gray-400">View MRP inventory levels</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-left transition-colors">
                <TrendingUp className="h-6 w-6 text-green-400 mb-2" />
                <p className="font-medium text-gray-200">Manage Clients</p>
                <p className="text-xs text-gray-400">View ClickUp clients</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-left transition-colors">
                <AlertCircle className="h-6 w-6 text-orange-400 mb-2" />
                <p className="font-medium text-gray-200">Create Task</p>
                <p className="text-xs text-gray-400">Generate optimization task</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Sidebar>
  );
}
