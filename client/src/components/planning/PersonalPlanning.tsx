import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PersonalPlanningProps {
  values: {
    eaTasks: string;
    paTasks: string;
    personalTasks: string;
  };
  onChange: (key: string, value: string) => void;
}

export function PersonalPlanning({ values, onChange }: PersonalPlanningProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Weekly Personal Planning</h2>
        <p className="text-muted-foreground mt-2">
          Organize your EA, PA, and personal tasks for the week ahead.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Executive Assistant (EA) Tasks</CardTitle>
            <CardDescription>
              Tasks and responsibilities for your Executive Assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter EA tasks and priorities..."
              value={values.eaTasks || ""}
              onChange={(e) => onChange("eaTasks", e.target.value)}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Assistant (PA) Tasks</CardTitle>
            <CardDescription>
              Tasks and responsibilities for your Personal Assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter PA tasks and priorities..."
              value={values.paTasks || ""}
              onChange={(e) => onChange("paTasks", e.target.value)}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Task List</CardTitle>
            <CardDescription>
              Your personal tasks and goals for the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your personal tasks..."
              value={values.personalTasks || ""}
              onChange={(e) => onChange("personalTasks", e.target.value)}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

