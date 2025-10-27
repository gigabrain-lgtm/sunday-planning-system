import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, List, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface TaskPlanningData {
  notes: string;
  targetWeek: string;
  priority: "urgent" | "high" | "normal" | "low";
}

type ViewMode = "list" | "timeline";

export default function Roadmap({ movedTasks }: RoadmapProps) {
  const { data: existingRoadmapTasks, isLoading } = trpc.needleMovers.fetchRoadmap.useQuery();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [planningData, setPlanningData] = useState<Record<string, TaskPlanningData>>({});
  const [savingTasks, setSavingTasks] = useState<Set<string>>(new Set());

  const updateRoadmapTask = trpc.needleMovers.updateRoadmapTask.useMutation({
    onSuccess: () => {
      toast.success("Planning details saved");
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const updatePlanningData = (taskId: string, field: keyof TaskPlanningData, value: string) => {
    setPlanningData((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  const handleSavePlanning = async (task: NeedleMover) => {
    if (!task.id) return;

    setSavingTasks((prev) => new Set(prev).add(task.id!));
    const data = planningData[task.id];

    try {
      await updateRoadmapTask.mutateAsync({
        taskId: task.id,
        notes: data?.notes || "",
        targetWeek: data?.targetWeek || "",
        priority: data?.priority || task.priority,
      });
    } finally {
      setSavingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(task.id!);
        return newSet;
      });
    }
  };

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

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
      case "high":
        return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700";
      case "low":
        return "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700";
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

  // Generate next 12 weeks starting from current week
  const generateWeeks = () => {
    const weeks = [];
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Get Monday
    const monday = new Date(today.setDate(diff));

    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(monday);
      weekStart.setDate(monday.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekNumber = getWeekNumber(weekStart);
      const year = weekStart.getFullYear();
      const weekString = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

      weeks.push({
        weekString,
        weekNumber,
        year,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
        label: `Week ${weekNumber}`,
        dateRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
      });
    }
    return weeks;
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const allTasks = [...movedTasks, ...(existingRoadmapTasks || [])];

  const renderListView = (tasks: NeedleMover[], isNewTasks: boolean = false) => {
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
        {tasks.map((task, index) => {
          const taskId = task.id || `moved-${index}`;
          const isSaving = savingTasks.has(taskId);
          const taskData = planningData[taskId] || {
            notes: "",
            targetWeek: "",
            priority: task.priority,
          };

          return (
            <div
              key={taskId}
              className="border rounded-lg"
            >
              {/* Task Header - Always Visible */}
              <div className="flex items-center justify-between p-4 bg-accent/30">
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

              {/* Planning Section - Always Expanded */}
              {task.id && (
                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${taskId}`}>Planning Notes</Label>
                    <Textarea
                      id={`notes-${taskId}`}
                      placeholder="Add notes about when and how to tackle this task..."
                      value={taskData.notes}
                      onChange={(e) => updatePlanningData(taskId, "notes", e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`target-${taskId}`}>Target Week</Label>
                      <Input
                        id={`target-${taskId}`}
                        type="week"
                        value={taskData.targetWeek}
                        onChange={(e) => updatePlanningData(taskId, "targetWeek", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`priority-${taskId}`}>Priority</Label>
                      <select
                        id={`priority-${taskId}`}
                        value={taskData.priority}
                        onChange={(e) =>
                          updatePlanningData(
                            taskId,
                            "priority",
                            e.target.value as TaskPlanningData["priority"]
                          )
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="urgent">🔴 Urgent</option>
                        <option value="high">🟠 High</option>
                        <option value="normal">🔵 Normal</option>
                        <option value="low">⚪ Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSavePlanning(task)}
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Planning
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimelineView = () => {
    const weeks = generateWeeks();
    
    // Group tasks by target week
    const tasksByWeek: Record<string, NeedleMover[]> = {};
    allTasks.forEach((task) => {
      const taskId = task.id || `moved-${allTasks.indexOf(task)}`;
      const targetWeek = planningData[taskId]?.targetWeek || "";
      if (!tasksByWeek[targetWeek]) {
        tasksByWeek[targetWeek] = [];
      }
      tasksByWeek[targetWeek].push(task);
    });

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Showing next 12 weeks - drag tasks to reschedule (coming soon)
        </div>
        
        {weeks.map((week) => {
          const weekTasks = tasksByWeek[week.weekString] || [];
          
          return (
            <Card key={week.weekString} className="overflow-hidden">
              <CardHeader className="py-3 bg-accent/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{week.label}, {week.year}</CardTitle>
                    <CardDescription className="text-xs">{week.dateRange}</CardDescription>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {weekTasks.length} {weekTasks.length === 1 ? "task" : "tasks"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {weekTasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No tasks scheduled
                  </div>
                ) : (
                  <div className="space-y-2">
                    {weekTasks.map((task, index) => {
                      const taskId = task.id || `moved-${index}`;
                      const taskData = planningData[taskId] || { priority: task.priority };
                      
                      return (
                        <div
                          key={taskId}
                          className={`p-3 rounded-lg border-2 ${getPriorityBgColor(taskData.priority || task.priority)}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getPriorityIcon(taskData.priority || task.priority)}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{task.name}</h4>
                              {task.assigneeName && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {task.assigneeName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📍 Roadmap</h2>
        <p className="text-muted-foreground">
          Plan when to tackle future tasks and organize by week
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          size="sm"
        >
          <List className="w-4 h-4 mr-2" />
          List View
        </Button>
        <Button
          variant={viewMode === "timeline" ? "default" : "outline"}
          onClick={() => setViewMode("timeline")}
          size="sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Timeline View
        </Button>
      </div>

      {viewMode === "list" ? (
        <>
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
                {renderListView(movedTasks, true)}
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
              {renderListView(existingRoadmapTasks || [])}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timeline</CardTitle>
            <CardDescription>
              All roadmap tasks organized by target week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderTimelineView()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

