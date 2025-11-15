import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Briefcase, AlertCircle, ExternalLink } from "lucide-react";

type PriorityLevel = "urgent" | "high" | "medium" | "normal" | "low" | "inactive";

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  normal: "bg-blue-500 text-white",
  low: "bg-gray-500 text-white",
  inactive: "bg-gray-400 text-white",
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  urgent: "🚩 Urgent",
  high: "🚩 High",
  medium: "🚩 Medium",
  normal: "🚩 Normal",
  low: "🚩 Low",
  inactive: "⊘ Inactive",
};

// Priority order for sorting
const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  normal: 4,
  low: 5,
  inactive: 6,
};

export function HiringPriorities() {
  const { data: priorities, isLoading, error, refetch } = trpc.hiring.priorities.list.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Hiring Priorities
          </CardTitle>
          <CardDescription>Review hiring priorities for Sunday planning</CardDescription>
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
          <CardDescription>Review hiring priorities for Sunday planning</CardDescription>
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

  // Filter out inactive priorities and sort by priority level
  const activePriorities = (priorities || [])
    .filter(p => p.priority !== 'inactive')
    .sort((a, b) => PRIORITY_ORDER[a.priority as PriorityLevel] - PRIORITY_ORDER[b.priority as PriorityLevel]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Hiring Priorities
            </CardTitle>
            <CardDescription>
              Review hiring priorities for Sunday planning ({activePriorities.length} active)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/hiring/priorities', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Priorities
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!activePriorities || activePriorities.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No active hiring priorities</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.open('/hiring/priorities', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Add Priorities
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activePriorities.map((priority) => (
              <div
                key={priority.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Badge className={PRIORITY_COLORS[priority.priority as PriorityLevel]}>
                  {PRIORITY_LABELS[priority.priority as PriorityLevel]}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{priority.jobTitle}</div>
                  {priority.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {priority.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
