import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function FulfilmentProducts() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Products
        </h1>
        <p className="text-muted-foreground">
          Product catalog with Keepa data and analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Browse and manage your Amazon products</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Product catalog functionality will be migrated here from the listing-optimization app.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Features: Product listings, Keepa integration, pricing data, competitor analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
