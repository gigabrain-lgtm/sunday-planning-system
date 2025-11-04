import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  FileText,
  CheckSquare,
  DollarSign,
  Calculator,
  Mic,
  ListTodo,
  MessageSquare,
  User,
  RefreshCw,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";

const categoryIcons: Record<string, any> = {
  urgent: Flame,
  payments: DollarSign,
  contracts: FileText,
  recording: Mic,
  individual: CheckSquare,
  bookkeeping: Calculator,
  todo: ListTodo,
  slack: MessageSquare,
  personal: User,
};

const categoryTitles: Record<string, string> = {
  urgent: "🔥 Urgent Tasks",
  payments: "💰 Pending Payments",
  contracts: "📝 Contracts to Sign",
  recording: "🎙️ Recording List",
  individual: "✅ Individual Tasks",
  bookkeeping: "📊 Bookkeeping Tasks",
  todo: "✅ To-Do",
  slack: "💬 Slack Tasks",
  personal: "👤 Personal Tasks",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-500",
  none: "bg-gray-400",
};

export default function Dashboard() {
  const { data, isLoading, error, refetch } = trpc.dashboard.getPendingItems.useQuery();
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [movingTasks, setMovingTasks] = useState<Set<string>>(new Set());

  const completeMutation = trpc.dashboard.completeTask.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Task completed!");
      setCompletingTasks(prev => {
        const next = new Set(prev);
        next.delete(variables.taskId);
        return next;
      });
      refetch();
    },
    onError: (error, variables) => {
      toast.error(`Failed to complete task: ${error.message}`);
      setCompletingTasks(prev => {
        const next = new Set(prev);
        next.delete(variables.taskId);
        return next;
      });
    },
  });

  const moveTaskMutation = trpc.dashboard.moveTaskToList.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Task moved to ${variables.targetList.toUpperCase()}!`);
      setMovingTasks(prev => {
        const next = new Set(prev);
        next.delete(variables.taskId);
        return next;
      });
      refetch();
    },
    onError: (error, variables) => {
      toast.error(`Failed to move task: ${error.message}`);
      setMovingTasks(prev => {
        const next = new Set(prev);
        next.delete(variables.taskId);
        return next;
      });
    },
  });

  const handleCompleteTask = async (taskId: string) => {
    if (confirm("Mark this task as complete?")) {
      setCompletingTasks(prev => new Set(prev).add(taskId));
      await completeMutation.mutateAsync({ taskId });
    }
  };

  const handleMoveTask = (taskId: string, targetList: 'ea' | 'pa') => {
    setMovingTasks(prev => new Set(prev).add(taskId));
    moveTaskMutation.mutate({ taskId, targetList });
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Failed to load dashboard: {error.message}
                  </p>
                  <Button onClick={() => refetch()} variant="outline" className="mt-4">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Sidebar>
    );
  }

  const { tasks, categories, total } = data || { tasks: { personal: [], ea: [], pa: [], total: 0 }, categories: {}, total: 0 };

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Pending items across all your lists
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

        {/* Total Count */}
        <Card>
          <CardHeader>
            <CardTitle className="text-5xl font-bold text-center">{total}</CardTitle>
            <CardDescription className="text-center text-lg">
              Total Pending Items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold">{tasks.personal?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Personal</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{tasks.ea?.length || 0}</div>
                <div className="text-sm text-muted-foreground">EA</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{tasks.pa?.length || 0}</div>
                <div className="text-sm text-muted-foreground">PA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories - Ordered by priority */}
        {['urgent', 'payments', 'contracts', 'recording', 'individual', 'bookkeeping', 'todo', 'slack', 'personal'].map((categoryKey) => {
          const categoryTasks = categories[categoryKey] || [];
          if (!categoryTasks || categoryTasks.length === 0) return null;

          const Icon = categoryIcons[categoryKey] || ListTodo;

          return (
            <Card key={categoryKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {categoryTitles[categoryKey] || categoryKey}
                  <Badge variant="secondary" className="ml-2">
                    {categoryTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{task.name}</h4>
                          {task.priority && task.priority.toLowerCase() !== 'none' && (
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  priorityColors[task.priority.toLowerCase()] || priorityColors.none
                                }`}
                              />
                              <span className="text-xs text-muted-foreground capitalize">
                                {task.priority}
                              </span>
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {task.listType.toUpperCase()}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{task.status}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span>Due: {new Date(parseInt(task.dueDate)).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {task.paymentLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(task.paymentLink, "_blank")}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                        {/* Show delegation buttons only for Personal tasks */}
                        {task.listType === 'personal' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveTask(task.id, 'ea')}
                              disabled={movingTasks.has(task.id)}
                              title="Send to EA"
                              className="text-xs"
                            >
                              {movingTasks.has(task.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Send to EA'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveTask(task.id, 'pa')}
                              disabled={movingTasks.has(task.id)}
                              title="Send to PA"
                              className="text-xs"
                            >
                              {movingTasks.has(task.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Send to PA'
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(task.url, "_blank")}
                          title="View in ClickUp"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completingTasks.has(task.id)}
                          title="Mark as complete"
                        >
                          {completingTasks.has(task.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {total === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  You have no pending items at the moment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </Sidebar>
  );
}
