import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Briefcase, Calendar, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface HiringPriority {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: {
    id: string;
    priority: string;
    color: string;
  } | null;
  assignees?: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  dueDate?: string;
  customFields?: Record<string, any>;
}

export function HiringPriorities() {
  const { data: priorities, isLoading, error, refetch } = trpc.hiring.fetchPriorities.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Hiring Priorities
          </CardTitle>
          <CardDescription>Review and manage hiring priorities from ClickUp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Hiring Priorities
          </CardTitle>
          <CardDescription>Review and manage hiring priorities from ClickUp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground">
              Failed to load hiring priorities: {error.message}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: HiringPriority["priority"]) => {
    if (!priority) return "bg-gray-500";
    return priority.color || "bg-gray-500";
  };

  const getPriorityLabel = (priority: HiringPriority["priority"]) => {
    if (!priority) return "Normal";
    return priority.priority || "Normal";
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("complete") || statusLower.includes("done")) {
      return "bg-green-500/10 text-green-700 border-green-500/20";
    }
    if (statusLower.includes("progress") || statusLower.includes("active")) {
      return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    }
    if (statusLower.includes("blocked") || statusLower.includes("hold")) {
      return "bg-red-500/10 text-red-700 border-red-500/20";
    }
    return "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const sortedPriorities = [...(priorities || [])].sort((a, b) => {
    // Sort by priority first (urgent > high > normal > low)
    const priorityOrder: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
    const aPriority = priorityOrder[a.priority?.priority?.toLowerCase() || "normal"] || 3;
    const bPriority = priorityOrder[b.priority?.priority?.toLowerCase() || "normal"] || 3;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Then by due date (earliest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Hiring Priorities
        </CardTitle>
        <CardDescription>
          Review and manage hiring priorities from ClickUp ({priorities?.length || 0} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!priorities || priorities.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No hiring priorities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPriorities.map((priority) => (
              <div
                key={priority.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{priority.name}</h3>
                      {priority.priority && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ backgroundColor: getPriorityColor(priority.priority) + "20" }}
                        >
                          {getPriorityLabel(priority.priority)}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(priority.status)}`}>
                        {priority.status}
                      </Badge>
                    </div>
                    
                    {priority.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {priority.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {priority.assignees && priority.assignees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{priority.assignees[0].username}</span>
                        </div>
                      )}
                      {priority.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(priority.dueDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    {priority.customFields && Object.keys(priority.customFields).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(priority.customFields).map(([key, value]) => {
                          if (value === null || value === undefined || value === "") return null;
                          return (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(`https://app.clickup.com/t/${priority.id}`, "_blank");
                    }}
                  >
                    View in ClickUp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="w-full"
          >
            Refresh Priorities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
