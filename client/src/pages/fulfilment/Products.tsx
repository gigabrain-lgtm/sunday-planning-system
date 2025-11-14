import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, RefreshCw, ExternalLink, Star } from "lucide-react";

interface Product {
  id: string;
  asin: string;
  title: string;
  brand: string | null;
  category: string | null;
  currentPrice: number | null;
  rating: number | null;
  reviewCount: number | null;
  salesRank: number | null;
  mainImage: string | null;
  monthlySales: number | null;
}

export default function FulfilmentProducts() {
  const [search, setSearch] = useState("");

  // Fetch products using React Query
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      // Handle both response formats
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (data.data?.products) {
        return data.data.products;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '-';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Sidebar>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Products
          </h1>
          <p className="text-muted-foreground">
            Product catalog with Keepa data and analytics
          </p>
        </div>
        <Button onClick={() => refetch()} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            type="text"
            placeholder="Search products by ASIN, title, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Error loading products: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {isLoading ? 'Loading...' : `${products.length} products found`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-48 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {search
                    ? 'Try adjusting your search terms.'
                    : 'No products have been added yet.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  {product.mainImage ? (
                    <div className="relative h-48 bg-muted">
                      <img
                        src={product.mainImage}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium line-clamp-2 text-sm flex-1">
                        {product.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        asChild
                      >
                        <a
                          href={`https://www.amazon.com/dp/${product.asin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-mono">
                        {product.asin}
                      </Badge>
                      {product.brand && (
                        <span className="truncate">{product.brand}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Price</div>
                      <div className="font-semibold">
                        {formatPrice(product.currentPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Sales Rank</div>
                      <div className="font-semibold">
                        {formatNumber(product.salesRank)}
                      </div>
                    </div>
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({formatNumber(product.reviewCount)} reviews)
                      </span>
                    </div>
                  )}

                  {product.monthlySales && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Est. Monthly Sales: </span>
                      <span className="font-medium">{formatNumber(product.monthlySales)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </Sidebar>
  );
}
