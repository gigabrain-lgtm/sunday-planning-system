import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Target } from "lucide-react";
import { useState } from "react";

interface KeyResultWithAction {
  id: string;
  action?: "needle_mover" | "automate" | "delegate" | "eliminate" | "roadmap";
}

export default function OKRReview() {
  const { data: objectives, isLoading: loadingObjectives } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults, isLoading: loadingKeyResults } = trpc.okr.fetchKeyResults.useQuery();
  const [selectedActions, setSelectedActions] = useState<Record<string, string>>({});
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);

  if (loadingObjectives || loadingKeyResults) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleActionSelect = (keyResultId: string, action: string) => {
    setSelectedActions((prev) => ({
      ...prev,
      [keyResultId]: action,
    }));
  };

  const getActionButton = (action: string, label: string, icon: string, color: string) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
    );
  };

  const getProgressPercentage = (kr: any) => {
    if (!kr.target || !kr.actual) return 0;
    return Math.round((kr.actual / kr.target) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🎯 OKR Review</h2>
        <p className="text-muted-foreground">
          Review your objectives and prioritize key results for the week
        </p>
      </div>

      {objectives && objectives.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No objectives found in ClickUp</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {objectives?.map((objective) => {
            const isExpanded = expandedObjective === objective.id;
            const objectiveKeyResults = keyResults?.filter((kr) => 
              // For now, show all key results. In production, you'd filter by relationship
              true
            ) || [];

            return (
              <Card key={objective.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30"
                  onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        {objective.name}
                      </CardTitle>
                      {objective.description && (
                        <CardDescription className="mt-2 text-sm">
                          <strong>Why this matters:</strong> {objective.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? "▼" : "▶"}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                          💡 Strategic Thinking
                        </h4>
                        <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                          <li>• What did we do last week toward this objective?</li>
                          <li>• What did we learn?</li>
                          <li>• What's the 20% of actions that will move the needle most?</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Key Results</h4>
                        <div className="space-y-3">
                          {objectiveKeyResults.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No key results for this objective
                            </p>
                          ) : (
                            objectiveKeyResults.map((kr) => {
                              const progress = getProgressPercentage(kr);
                              const selectedAction = selectedActions[kr.id];

                              return (
                                <Card key={kr.id} className="border-2">
                                  <CardContent className="pt-4">
                                    <div className="space-y-3">
                                      {/* Key Result Header */}
                                      <div>
                                        <h5 className="font-medium">{kr.name}</h5>
                                        {kr.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {kr.description}
                                          </p>
                                        )}
                                      </div>

                                      {/* Progress Bar */}
                                      {kr.target && (
                                        <div>
                                          <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">
                                              {kr.actual || 0} / {kr.target} ({progress}%)
                                            </span>
                                          </div>
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                              className={`h-2 rounded-full transition-all ${getProgressColor(progress)}`}
                                              style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      <div>
                                        <p className="text-sm font-medium mb-2">Choose an action:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                          <Button
                                            variant={selectedAction === "needle_mover" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleActionSelect(kr.id, "needle_mover")}
                                            className="flex items-center gap-2 justify-start"
                                          >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-xs">This Week</span>
                                          </Button>

                                          <Button
                                            variant={selectedAction === "automate" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleActionSelect(kr.id, "automate")}
                                            className="flex items-center gap-2 justify-start"
                                          >
                                            <span className="text-base">🤖</span>
                                            <span className="text-xs">Automate</span>
                                          </Button>

                                          <Button
                                            variant={selectedAction === "delegate" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleActionSelect(kr.id, "delegate")}
                                            className="flex items-center gap-2 justify-start"
                                          >
                                            <span className="text-base">👥</span>
                                            <span className="text-xs">Delegate</span>
                                          </Button>

                                          <Button
                                            variant={selectedAction === "eliminate" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleActionSelect(kr.id, "eliminate")}
                                            className="flex items-center gap-2 justify-start"
                                          >
                                            <span className="text-base">❌</span>
                                            <span className="text-xs">Eliminate</span>
                                          </Button>

                                          <Button
                                            variant={selectedAction === "roadmap" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleActionSelect(kr.id, "roadmap")}
                                            className="flex items-center gap-2 justify-start"
                                          >
                                            <span className="text-base">🗺️</span>
                                            <span className="text-xs">Roadmap</span>
                                          </Button>
                                        </div>
                                      </div>

                                      {selectedAction && (
                                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded border border-green-200 dark:border-green-800">
                                          <p className="text-sm text-green-800 dark:text-green-200">
                                            ✓ Marked as: <strong>{selectedAction.replace("_", " ").toUpperCase()}</strong>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {Object.keys(selectedActions).length > 0 && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">📊 This Week's Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Needle Movers:</strong>{" "}
                {Object.values(selectedActions).filter((a) => a === "needle_mover").length} tasks
              </p>
              <p className="text-sm">
                <strong>To Automate:</strong>{" "}
                {Object.values(selectedActions).filter((a) => a === "automate").length} tasks
              </p>
              <p className="text-sm">
                <strong>To Delegate:</strong>{" "}
                {Object.values(selectedActions).filter((a) => a === "delegate").length} tasks
              </p>
              <p className="text-sm">
                <strong>To Eliminate:</strong>{" "}
                {Object.values(selectedActions).filter((a) => a === "eliminate").length} tasks
              </p>
              <p className="text-sm">
                <strong>To Roadmap:</strong>{" "}
                {Object.values(selectedActions).filter((a) => a === "roadmap").length} tasks
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

