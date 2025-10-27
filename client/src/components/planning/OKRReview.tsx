import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OKRReview() {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedKeyResults, setExpandedKeyResults] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Record<string, string>>({});

  const { data: objectives, isLoading: loadingObjectives } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults, isLoading: loadingKeyResults } = trpc.okr.fetchKeyResults.useQuery();

  const toggleObjective = (id: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedObjectives(newExpanded);
  };

  const toggleKeyResult = (id: string) => {
    const newExpanded = new Set(expandedKeyResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedKeyResults(newExpanded);
  };

  const handleAction = (subtaskId: string, action: string) => {
    setSelectedActions((prev) => ({ ...prev, [subtaskId]: action }));
    
    const actionLabels: Record<string, string> = {
      needle_mover: "NEEDLE_MOVER",
      automate: "AUTOMATE",
      delegate: "DELEGATE",
      eliminate: "ELIMINATE",
      roadmap: "ROADMAP",
    };
    
    toast.success(`✓ Marked as: ${actionLabels[action]}`);
  };

  if (loadingObjectives || loadingKeyResults) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <span className="text-4xl">🎯</span>
          OKR Review
        </h2>
        <p className="text-muted-foreground mt-2">
          Review your objectives and prioritize key results for the week
        </p>
      </div>

      {objectives?.map((objective: any) => {
        const isExpanded = expandedObjectives.has(objective.id);
        // For now, show all key results under each objective since relationships aren't set in ClickUp
        // TODO: Filter by kr.objectiveIds once relationships are configured in ClickUp
        const objectiveKeyResults = keyResults || [];

        return (
          <div
            key={objective.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <button
              onClick={() => toggleObjective(objective.id)}
              className="w-full flex items-start justify-between text-left"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{objective.name}</h3>
                  {isExpanded && objective.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Why this matters: {objective.description}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {isExpanded ? "▼" : "▶"}
              </Button>
            </button>

            {isExpanded && (
              <div className="mt-6 space-y-6">
                {/* Key Results */}
                <div>
                  <h4 className="font-semibold mb-4">Key Results</h4>
                  {objectiveKeyResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No key results for this objective</p>
                  ) : (
                    <div className="space-y-4">
                      {objectiveKeyResults.map((kr: any) => {
                        const krExpanded = expandedKeyResults.has(kr.id);
                        
                        return (
                          <div
                            key={kr.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <button
                              onClick={() => toggleKeyResult(kr.id)}
                              className="w-full flex items-start justify-between text-left"
                            >
                              <div className="flex-1">
                                <h5 className="font-medium">{kr.name}</h5>
                                {kr.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {kr.description}
                                  </p>
                                )}
                                {(kr.target || kr.actual || kr.baseline) && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    {kr.baseline && `Baseline: ${kr.baseline} | `}
                                    {kr.actual && `Actual: ${kr.actual} | `}
                                    {kr.target && `Target: ${kr.target}`}
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm">
                                {krExpanded ? "▼" : "▶"}
                              </Button>
                            </button>

                            {krExpanded && (
                              <div className="mt-4 space-y-4">
                                {/* Strategic Thinking Questions */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                  <h6 className="font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2 mb-3">
                                    <span>💡</span>
                                    Strategic Thinking
                                  </h6>
                                  <ul className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
                                    <li>• What did we do last week toward this key result?</li>
                                    <li>• What did we learn?</li>
                                    <li>• What's the 20% of actions that will move the needle most?</li>
                                  </ul>
                                </div>

                                {/* Subtasks */}
                                {kr.subtasks && kr.subtasks.length > 0 ? (
                                  <div>
                                    <h6 className="font-semibold mb-3">Tasks to prioritize:</h6>
                                    <div className="space-y-3">
                                      {kr.subtasks.map((subtask: any) => {
                                        const selectedAction = selectedActions[subtask.id];
                                        
                                        return (
                                          <div
                                            key={subtask.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                                          >
                                            <div>
                                              <h6 className="font-medium">{subtask.name}</h6>
                                              {subtask.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                  {subtask.description}
                                                </p>
                                              )}
                                              {subtask.assignees && subtask.assignees.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Assigned: {subtask.assignees.map((a: any) => a.username).join(", ")}
                                                </p>
                                              )}
                                            </div>

                                            <div>
                                              <p className="text-sm font-medium mb-2">Choose an action:</p>
                                              <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                  variant={selectedAction === "needle_mover" ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() => handleAction(subtask.id, "needle_mover")}
                                                  className="justify-start"
                                                >
                                                  <span className="mr-2">✓</span>
                                                  This Week
                                                </Button>
                                                <Button
                                                  variant={selectedAction === "automate" ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() => handleAction(subtask.id, "automate")}
                                                  className="justify-start"
                                                >
                                                  <span className="mr-2">🤖</span>
                                                  Automate
                                                </Button>
                                                <Button
                                                  variant={selectedAction === "delegate" ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() => handleAction(subtask.id, "delegate")}
                                                  className="justify-start"
                                                >
                                                  <span className="mr-2">👥</span>
                                                  Delegate
                                                </Button>
                                                <Button
                                                  variant={selectedAction === "eliminate" ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() => handleAction(subtask.id, "eliminate")}
                                                  className="justify-start"
                                                >
                                                  <span className="mr-2">❌</span>
                                                  Eliminate
                                                </Button>
                                                <Button
                                                  variant={selectedAction === "roadmap" ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() => handleAction(subtask.id, "roadmap")}
                                                  className="justify-start col-span-2"
                                                >
                                                  <span className="mr-2">🗺️</span>
                                                  Roadmap
                                                </Button>
                                              </div>
                                            </div>

                                            {selectedAction && (
                                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 text-sm text-green-800 dark:text-green-200">
                                                ✓ Marked as: {selectedAction.replace("_", " ").toUpperCase()}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No subtasks for this key result. Add tasks in ClickUp to prioritize them here.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

