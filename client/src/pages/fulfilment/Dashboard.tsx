import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function FulfilmentDashboard() {
  return (
    <Sidebar>
      <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fulfilment Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Amazon FBA operations and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$491,094.93</div>
            <p className="text-xs text-muted-foreground">Across all sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100+</div>
            <p className="text-xs text-muted-foreground">In MRP inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">ClickUp clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Creative tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across your fulfilment operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System deployed successfully</p>
                <p className="text-xs text-muted-foreground">Fulfilment module is now live</p>
              </div>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/fulfilment/inventory" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="h-6 w-6 mb-2 text-orange-500" />
              <p className="font-medium">View Inventory</p>
              <p className="text-sm text-muted-foreground">Check stock levels and create tasks</p>
            </a>
            <a href="/fulfilment/clients" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-6 w-6 mb-2 text-green-500" />
              <p className="font-medium">Manage Clients</p>
              <p className="text-sm text-muted-foreground">View and configure client settings</p>
            </a>
            <a href="/fulfilment/products" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-6 w-6 mb-2 text-purple-500" />
              <p className="font-medium">Browse Products</p>
              <p className="text-sm text-muted-foreground">View product catalog and analytics</p>
            </a>
          </div>
        </CardContent>
      </Card>
      </div>
    </Sidebar>
  );
}
