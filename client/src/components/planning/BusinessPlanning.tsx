import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_CATEGORIES } from "@/data/manifestationStates";

interface BusinessPlanningProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function BusinessPlanning({ values, onChange }: BusinessPlanningProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Weekly Business Planning</h2>
        <p className="text-muted-foreground mt-2">
          Plan your business strategy across all key areas to move the needle forward.
        </p>
      </div>

      <div className="grid gap-6">
        {BUSINESS_CATEGORIES.map((category) => (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle>{category.label}</CardTitle>
              <CardDescription>
                What are your plans and goals for {category.label.toLowerCase()} this week?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Enter your ${category.label.toLowerCase()} planning notes...`}
                value={values[category.key] || ""}
                onChange={(e) => onChange(category.key, e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

