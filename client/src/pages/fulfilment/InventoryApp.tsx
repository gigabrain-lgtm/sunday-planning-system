import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MRPInventoryItem {
  asin: string;
  sku: string;
  product_name: string;
  condition: string;
  your_price: string;
  mfn_fulfillable_quantity: number;
  afn_fulfillable_quantity: number;
  afn_unsellable_quantity: number;
  afn_reserved_quantity: number;
  afn_total_quantity: number;
  afn_inbound_working_quantity: number;
  afn_inbound_shipped_quantity: number;
  afn_inbound_receiving_quantity: number;
  snapshot_date: string;
}

interface MRPSeller {
  id: number;
  name: string;
  selling_partner_id: string;
  state: string;
  advertising_data_initialized: boolean;
  financial_data_initialized: boolean;
}

type TaskType = 'Main Image' | 'Gallery Images' | 'A+ Content' | 'Change Price' | 'Apply Coupon/Discount';

export default function InventoryApp() {
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  // Using sonner for toast notifications
  const queryClient = useQueryClient();

  // Fetch sellers
  const { data: sellers, isLoading: loadingSellers } = useQuery<MRPSeller[]>({
    queryKey: ["/api/fulfilment/getSellers"],
  });

  // Fetch inventory for selected seller
  const { data: inventoryData, isLoading: loadingInventory } = useQuery({
    queryKey: ["/api/fulfilment/getInventory", { sellerName: selectedSeller }],
    enabled: !!selectedSeller,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (params: { product: MRPInventoryItem; taskType: TaskType }) => {
      const response = await fetch("/api/fulfilment/createTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Task Created! ClickUp task ID: ${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleCreateTask = (product: MRPInventoryItem, taskType: TaskType) => {
    if (confirm(`Create ${taskType} task for ${product.product_name}?`)) {
      createTaskMutation.mutate({ product, taskType });
    }
  };

  const inventory = inventoryData?.products || [];
  const totalValue = inventory.reduce((sum: number, item: MRPInventoryItem) => {
    return sum + (parseFloat(item.your_price) * item.afn_fulfillable_quantity);
  }, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">MRP Inventory</h1>
        </div>
        <p className="text-gray-600">
          View product inventory and create optimization tasks
        </p>
      </div>

      {/* Seller Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Seller</CardTitle>
          <CardDescription>Choose an MRP seller to view their inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSeller} onValueChange={setSelectedSeller} disabled={loadingSellers}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder={loadingSellers ? "Loading sellers..." : "-- Select a seller --"} />
            </SelectTrigger>
            <SelectContent>
              {sellers?.map((seller) => (
                <SelectItem key={seller.id} value={seller.name}>
                  {seller.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      {selectedSeller && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory for {selectedSeller}</CardTitle>
            <CardDescription>
              {inventory.length > 0 && `Showing ${inventory.length} products | Total Value: $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInventory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : inventory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No inventory found for this seller.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ASIN</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Sellable</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Reserved</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Value</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item: MRPInventoryItem) => {
                      const value = parseFloat(item.your_price) * item.afn_fulfillable_quantity;
                      return (
                        <tr key={item.asin + item.sku} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <a
                              href={`https://www.amazon.com/dp/${item.asin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {item.asin}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={item.product_name}>
                            {item.product_name}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">${item.your_price}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{item.afn_fulfillable_quantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{item.afn_reserved_quantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{item.afn_total_quantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
                                onClick={() => handleCreateTask(item, 'Main Image')}
                                disabled={createTaskMutation.isPending}
                              >
                                Main Image
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                                onClick={() => handleCreateTask(item, 'Gallery Images')}
                                disabled={createTaskMutation.isPending}
                              >
                                Gallery
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                onClick={() => handleCreateTask(item, 'A+ Content')}
                                disabled={createTaskMutation.isPending}
                              >
                                A+ Content
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                                onClick={() => handleCreateTask(item, 'Change Price')}
                                disabled={createTaskMutation.isPending}
                              >
                                Price
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-orange-50 hover:bg-orange-100 border-orange-200"
                                onClick={() => handleCreateTask(item, 'Apply Coupon/Discount')}
                                disabled={createTaskMutation.isPending}
                              >
                                Coupon
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
