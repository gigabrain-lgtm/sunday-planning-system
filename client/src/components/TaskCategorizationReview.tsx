import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Check, X, Edit } from "lucide-react";

interface Suggestion {
  taskId: string | undefined;
  taskName: string;
  keyResultId: string | undefined;
  keyResultName: string;
  objectiveId: string | undefined;
  objectiveName: string;
  confidence: number;
  assigneeId?: number;
  assigneeName?: string;
}

interface TaskCategorizationReviewProps {
  onClose: () => void;
}

export default function TaskCategorizationReview({ onClose }: TaskCategorizationReviewProps) {
  const { data: suggestions, isLoading } = trpc.okr.suggestTaskMappings.useQuery();
  const { data: objectives } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults } = trpc.okr.fetchKeyResults.useQuery();
  const linkTasksMutation = trpc.okr.linkTaskToKeyResult.useMutation();
  const updateTaskMutation = trpc.needleMovers.update.useMutation();
  const utils = trpc.useUtils();

  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, { keyResultId: string; objectiveId: string }>>({});
  const [editedTaskNames, setEditedTaskNames] = useState<Record<string, string>>({});
  const [skippedTasks, setSkippedTasks] = useState<Set<string>>(new Set());
  const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());
  const [editingTasks, setEditingTasks] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Initialize all tasks in edit mode by default
  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      const allTaskIds = suggestions
        .filter((s: Suggestion) => s.taskId)
        .map((s: Suggestion) => s.taskId as string);
      setEditingTasks(new Set(allTaskIds));
    }
  }, [suggestions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tasks to Categorize</CardTitle>
          <CardDescription>
            All Needle Movers tasks are already linked to Key Results, or there are no tasks to categorize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  const handleSkip = (taskId: string) => {
    setSkippedTasks(prev => new Set(prev).add(taskId));
    setApprovedTasks(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const handleApprove = (taskId: string) => {
    setApprovedTasks(prev => new Set(prev).add(taskId));
    setSkippedTasks(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const handleEdit = (taskId: string, keyResultId: string, objectiveId: string) => {
    setEditedSuggestions(prev => ({
      ...prev,
      [taskId]: { keyResultId, objectiveId }
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const tasksToSave = suggestions.filter((s: Suggestion) => 
        s.taskId && approvedTasks.has(s.taskId) && !skippedTasks.has(s.taskId)
      );

      for (const suggestion of tasksToSave) {
        if (!suggestion.taskId || !suggestion.keyResultId) continue;
        
        const edited = editedSuggestions[suggestion.taskId];
        const keyResultId = edited?.keyResultId || suggestion.keyResultId;
        const editedName = editedTaskNames[suggestion.taskId];

        // Update task name if it was edited
        if (editedName && editedName !== suggestion.taskName) {
          await updateTaskMutation.mutateAsync({
            taskId: suggestion.taskId,
            name: editedName
          });
        }

        // Link task to key result
        await linkTasksMutation.mutateAsync({
          taskId: suggestion.taskId,
          keyResultId,
          linkType: "blocking" as const
        });
      }

      toast.success(`Successfully categorized ${tasksToSave.length} tasks!`);
      
      // Invalidate queries to refresh data
      await utils.needleMovers.fetchBusiness.invalidate();
      await utils.needleMovers.fetchPersonal.invalidate();
      
      onClose();
    } catch (error) {
      console.error("Error saving categorizations:", error);
      toast.error("Failed to save categorizations");
    } finally {
      setIsSaving(false);
    }
  };

  const getKeyResultsForObjective = (objectiveId: string) => {
    if (!keyResults) return [];
    return keyResults.filter(kr => kr.objectiveIds?.includes(objectiveId));
  };

  const activeSuggestions = suggestions.filter((s: Suggestion) => s.taskId && !skippedTasks.has(s.taskId));
  const approvedCount = activeSuggestions.filter((s: Suggestion) => s.taskId && approvedTasks.has(s.taskId)).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Task Categorization</CardTitle>
          <CardDescription>
            Review and approve AI suggestions for mapping tasks to Key Results. 
            {approvedCount > 0 && ` ${approvedCount} of ${activeSuggestions.length} approved.`}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {suggestions.map((suggestion: Suggestion) => {
          if (!suggestion.taskId || !suggestion.keyResultId || !suggestion.objectiveId) return null;
          
          // Type assertions after null check
          const taskId = suggestion.taskId as string;
          const keyResultId = suggestion.keyResultId as string;
          const objectiveId = suggestion.objectiveId as string;
          
          if (skippedTasks.has(taskId)) return null;

          const isApproved = approvedTasks.has(taskId);
          const isEditing = editingTasks.has(taskId);
          const edited = editedSuggestions[taskId];
          const currentKeyResultId = edited?.keyResultId || keyResultId;
          const currentObjectiveId = edited?.objectiveId || objectiveId;
          const currentTaskName = editedTaskNames[taskId] || suggestion.taskName;

          return (
            <Card key={taskId} className={isApproved ? "border-green-500 bg-green-50" : ""}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    {isEditing ? (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Task Name
                        </label>
                        <input
                          type="text"
                          value={currentTaskName}
                          onChange={(e) => {
                            setEditedTaskNames(prev => ({
                              ...prev,
                              [taskId]: e.target.value
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg"
                          placeholder="Enter task name"
                        />
                      </div>
                    ) : (
                      <div className="font-semibold text-lg">{currentTaskName}</div>
                    )}
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                      <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                      {suggestion.assigneeName && (
                        <span className="flex items-center gap-1">
                          <span>•</span>
                          <span>Assigned to: <span className="font-medium text-gray-700">{suggestion.assigneeName}</span></span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Objective
                      </label>
                      {isEditing ? (
                        <Select
                          value={currentObjectiveId}
                          onValueChange={(objectiveId) => {
                            const firstKR = getKeyResultsForObjective(objectiveId)[0];
                            if (firstKR) {
                              handleEdit(taskId, firstKR.id || "", objectiveId);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue className="truncate">
                              <span className="truncate block">
                                {objectives?.find(obj => obj.id === currentObjectiveId)?.name || "Select objective"}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-w-[600px]">
                            {objectives?.map((obj) => (
                              <SelectItem key={obj.id} value={obj.id || ""} className="max-w-full">
                                <div className="truncate max-w-[550px]" title={obj.name}>
                                  {obj.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md border border-gray-200">
                          {objectives?.find(obj => obj.id === currentObjectiveId)?.name || "Select an objective"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Key Result
                      </label>
                      {isEditing ? (
                        <Select
                          value={currentKeyResultId}
                          onValueChange={(keyResultId) => {
                            handleEdit(taskId, keyResultId, currentObjectiveId);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue className="truncate">
                              <span className="truncate block">
                                {keyResults?.find(kr => kr.id === currentKeyResultId)?.name || "Select key result"}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-w-[600px]">
                            {getKeyResultsForObjective(currentObjectiveId).map((kr) => (
                              <SelectItem key={kr.id} value={kr.id || ""} className="max-w-full">
                                <div className="truncate max-w-[550px]" title={kr.name}>
                                  {kr.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md border border-gray-200">
                          {keyResults?.find(kr => kr.id === currentKeyResultId)?.name || "Select a key result"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isApproved ? (
                      <>
                        {!isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(taskId)}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTasks(prev => new Set(prev).add(taskId));
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSkip(taskId)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Skip
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setEditingTasks(prev => {
                                  const next = new Set(prev);
                                  next.delete(taskId);
                                  return next;
                                });
                                handleApprove(taskId);
                              }}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Done Editing
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTasks(prev => {
                                  const next = new Set(prev);
                                  next.delete(taskId);
                                  return next;
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setApprovedTasks(prev => {
                            const next = new Set(prev);
                            next.delete(taskId);
                            return next;
                          });
                          setEditingTasks(prev => new Set(prev).add(taskId));
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3 justify-end sticky bottom-0 bg-white p-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSaveAll} 
          disabled={approvedCount === 0 || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            `Save ${approvedCount} Categorization${approvedCount !== 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </div>
  );
}

