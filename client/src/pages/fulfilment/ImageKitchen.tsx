import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Sparkles, Wand2, Upload } from "lucide-react";

export default function FulfilmentImageKitchen() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          Image Kitchen
        </h1>
        <p className="text-muted-foreground">
          AI-powered image generation and editing tools
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Image Generation */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wand2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI Image Generation</CardTitle>
            </div>
            <CardDescription>
              Generate product images using AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create stunning product images with GPT-Image-1 and Gemini 2.5 Flash models.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Image Editing */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Image Editing</CardTitle>
            </div>
            <CardDescription>
              Edit and enhance existing product images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Crop, resize, adjust colors, and apply filters to your product images.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Batch Processing */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Batch Processing</CardTitle>
            </div>
            <CardDescription>
              Process multiple images at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and process multiple product images in bulk operations.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Image Kitchen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Image Kitchen is a powerful suite of AI-powered tools for creating and editing product images for Amazon listings.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium">Features (Coming Soon):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>AI-powered image generation with multiple models</li>
              <li>Competitor image analysis</li>
              <li>Automated prompt generation</li>
              <li>Image editing and enhancement tools</li>
              <li>Batch processing for multiple products</li>
              <li>Project management and tracking</li>
              <li>Cost tracking and analytics</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Migration Status</h3>
            <p className="text-sm text-muted-foreground">
              Image Kitchen functionality will be migrated from the listing-optimization app.
              This includes AI image generation, project management, and all related tools.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
