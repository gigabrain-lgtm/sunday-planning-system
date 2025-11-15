import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Package, Users, ShoppingCart, Image, BarChart3 } from "lucide-react";

export default function Fulfilment() {
  const sections = [
    {
      title: "Dashboard",
      description: "Overview of fulfilment metrics and performance",
      icon: BarChart3,
      href: "/fulfilment/dashboard",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clients",
      description: "Manage ClickUp clients and seller mappings",
      icon: Users,
      href: "/fulfilment/clients",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Products",
      description: "Product catalog with Keepa data and analytics",
      icon: ShoppingCart,
      href: "/fulfilment/products",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Inventory",
      description: "MRP inventory management and task creation",
      icon: Package,
      href: "/fulfilment/inventory",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Image Kitchen",
      description: "AI-powered image generation and editing tools",
      icon: Image,
      href: "/fulfilment/image-kitchen",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <Sidebar>
      <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fulfilment</h1>
        <p className="text-muted-foreground">
          Manage Amazon FBA operations, inventory, and creative tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold">20</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">MRP Sellers</p>
              <p className="text-2xl font-bold">30</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </Sidebar>
  );
}
