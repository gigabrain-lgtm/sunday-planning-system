import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export default function FulfilmentImageKitchen() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Image className="h-8 w-8" />
          Image Kitchen
        </h1>
        <p className="text-muted-foreground">
          AI-powered image generation and editing tools
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creative Tools</CardTitle>
          <CardDescription>Generate and edit product images with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Image Kitchen functionality will be migrated here from the listing-optimization app.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Features: AI image generation, background removal, image editing, batch processing
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
