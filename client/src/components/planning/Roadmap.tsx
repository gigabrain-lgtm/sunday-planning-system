import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface NeedleMover {
  id?: string;
  name: string;
  priority: "urgent" | "high" | "normal" | "low";
  assigneeId?: number;
  assigneeName?: string;
}

interface RoadmapProps {
  movedTasks: NeedleMover[];
}

export default function Roadmap({ movedTasks }: RoadmapProps) {
  const { data: existingRoadmapTasks, isLoading } = trpc.needleMovers.fetchRoadmap.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "low":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔴";
      case "high":
        return "🟠";
      case "low":
        return "⚪";
      default:
        return "🔵";
    }
  };

  const renderTaskList = (tasks: NeedleMover[]) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-4xl mb-4">🗺️</p>
          <p>No tasks in this section</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id || `moved-${index}`}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{getPriorityIcon(task.priority)}</span>
              <div>
                <h4 className="font-medium">{task.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  {task.assigneeName && (
                    <p className="text-sm text-muted-foreground">
                      Assigned: {task.assigneeName}
                    </p>
                  )}
                  <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📍 Roadmap</h2>
        <p className="text-muted-foreground">
          Future tasks and ideas for upcoming weeks
        </p>
      </div>

      {/* New Roadmap Tasks (moved during this session) */}
      {movedTasks.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">
              New Roadmap Tasks ({movedTasks.length})
            </CardTitle>
            <CardDescription>
              Tasks moved to roadmap during this planning session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderTaskList(movedTasks)}
          </CardContent>
        </Card>
      )}

      {/* Existing Roadmap from ClickUp */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Roadmap ({existingRoadmapTasks?.length || 0})</CardTitle>
          <CardDescription>
            Tasks already in your ClickUp Roadmap list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTaskList(existingRoadmapTasks || [])}
        </CardContent>
      </Card>
    </div>
  );
}
