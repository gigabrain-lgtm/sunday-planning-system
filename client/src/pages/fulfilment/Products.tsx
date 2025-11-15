import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, RefreshCw, Package } from "lucide-react";

export default function FulfilmentProducts() {
  const [search, setSearch] = useState("");

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-950 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-white">
              <ShoppingCart className="h-8 w-8" />
              Products
            </h1>
            <p className="text-gray-400">
              Product catalog with Keepa data and analytics
            </p>
          </div>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <Input
            placeholder="Search products by ASIN, title, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Product List */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Product Catalog</h2>
            <p className="text-sm text-gray-400">Keepa integration coming soon</p>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="h-16 w-16 mb-4" />
            <p className="font-medium text-lg">No products yet</p>
            <p className="text-sm">Product catalog will be available once Keepa integration is complete</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
