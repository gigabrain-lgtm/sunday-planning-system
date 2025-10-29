import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { OKRBadge } from "@/components/OKRBadge";
import TaskCategorizationReview from "../TaskCategorizationReview";

interface NeedleMover {
  id?: string;
  name: string;
  description?: string;
  priority: "urgent" | "high" | "normal" | "low";
  confidenceLevel?: number;
  lastWeekConfidence?: number;
  assigneeId?: number;
  assigneeName?: string;
  linkedKeyResultId?: string;
  linkedKeyResultName?: string;
  linkedObjectiveId?: string;
  linkedObjectiveName?: string;
}

interface BusinessNeedleMoversProps {
  businessPlanningNotes?: Record<string, string>;
  onCompletedTasksChange?: (taskIds: string[]) => void;
  onNewNeedleMoversChange?: (needleMovers: NeedleMover[]) => void;
  onMovedToRoadmapChange?: (movedTasks: NeedleMover[]) => void;
}

export function BusinessNeedleMovers({ 
  businessPlanningNotes, 
  onCompletedTasksChange,
  onNewNeedleMoversChange,
  onMovedToRoadmapChange
}: BusinessNeedleMoversProps) {
  const { user } = useAuth();
  const [newNeedleMovers, setNewNeedleMovers] = useState<NeedleMover[]>([]);
  const [editingPriorities, setEditingPriorities] = useState<Record<string, string>>({});
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [movedToRoadmapIds, setMovedToRoadmapIds] = useState<string[]>([]);
  const [showCategorizationReview, setShowCategorizationReview] = useState(false);

  const { data: existingNeedleMovers, isLoading, refetch } = trpc.needleMovers.fetchBusiness.useQuery();
  const { data: teamMembers } = trpc.needleMovers.getTeamMembers.useQuery({ listType: "business" });
  const { data: objectives, isLoading: objectivesLoading, error: objectivesError } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults, isLoading: keyResultsLoading } = trpc.okr.fetchKeyResults.useQuery();
  
  // Debug logging
  useEffect(() => {
    console.log('[NeedleMovers] Objectives:', objectives);
    console.log('[NeedleMovers] Objectives Loading:', objectivesLoading);
    console.log('[NeedleMovers] Objectives Error:', objectivesError);
    console.log('[NeedleMovers] Key Results:', keyResults);
  }, [objectives, objectivesLoading, objectivesError, keyResults]);

  // Use team members from ClickUp API, fallback to extracting from existing tasks
  const availableAssignees = teamMembers && teamMembers.length > 0
    ? teamMembers
    : existingNeedleMovers
    ? Array.from(
        new Map(
          existingNeedleMovers
            .filter(nm => nm.assigneeId && nm.assigneeName)
            .map(nm => [nm.assigneeId, { 
              id: nm.assigneeId!, 
              username: nm.assigneeName!
            }])
        ).values()
      )
    : [];

  const updateMutation = trpc.needleMovers.update.useMutation({
    onSuccess: () => {
      toast.success("Priority updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const createMutation = trpc.needleMovers.createBusiness.useMutation({
    onSuccess: () => {
      toast.success("Needle mover added to ClickUp!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const moveToRoadmapMutation = trpc.needleMovers.moveToRoadmap.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Moved to Roadmap!");
      const updatedIds = [...movedToRoadmapIds, variables.taskId];
      setMovedToRoadmapIds(updatedIds);
      
      // Update parent with moved tasks
      const movedTasks = existingNeedleMovers?.filter(nm => updatedIds.includes(nm.id!)) || [];
      onMovedToRoadmapChange?.(movedTasks);
      
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to move: ${error.message}`);
    },
  });

  const linkOKRMutation = trpc.okr.linkNeedleMoverToOKR.useMutation({
    onSuccess: () => {
      toast.success("OKR linkage saved!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to link OKR: ${error.message}`);
    },
  });

  // State to track selected OKRs for each task
  const [selectedObjectives, setSelectedObjectives] = useState<Record<string, string>>({});
  const [selectedKeyResults, setSelectedKeyResults] = useState<Record<string, string>>({});

  // Filter key results based on selected objective
  const getKeyResultsForObjective = (objectiveId: string) => {
    if (!keyResults) return [];
    return keyResults.filter(kr => kr.objectiveId === objectiveId);
  };

  const handleLinkOKR = async (taskId: string) => {
    const objectiveId = selectedObjectives[taskId];
    const keyResultId = selectedKeyResults[taskId];
    
    if (!objectiveId || !keyResultId) {
      toast.error("Please select both an Objective and Key Result");
      return;
    }
    
    await linkOKRMutation.mutateAsync({
      taskId,
      keyResultId,
      objectiveId,
    });
  };

  // Notify parent component of completed tasks
  useEffect(() => {
    if (onCompletedTasksChange) {
      onCompletedTasksChange(completedTaskIds);
    }
  }, [completedTaskIds, onCompletedTasksChange]);

  // Notify parent of new needle movers
  useEffect(() => {
    if (onNewNeedleMoversChange) {
      onNewNeedleMoversChange(newNeedleMovers);
    }
  }, [newNeedleMovers, onNewNeedleMoversChange]);

  // Auto-populate from business planning notes
  useEffect(() => {
    if (businessPlanningNotes && Object.keys(businessPlanningNotes).length > 0) {
      const populated: NeedleMover[] = [];
      Object.entries(businessPlanningNotes).forEach(([category, notes]) => {
        if (notes && notes.trim()) {
          // Split by newlines to get individual tasks
          const tasks = notes.split('\n').filter(t => t.trim());
          tasks.forEach(task => {
            if (task.trim()) {
              populated.push({
                name: task.trim(),
                description: `From ${category}`,
                priority: "normal",
                confidenceLevel: 5,
              });
            }
          });
        }
      });
      if (populated.length > 0) {
        setNewNeedleMovers(populated);
      }
    }
  }, [businessPlanningNotes]);

  const addNewNeedleMover = () => {
    setNewNeedleMovers([
      { name: "", priority: "normal", confidenceLevel: 5 },
      ...newNeedleMovers,
    ]);
  };

  const updateNewNeedleMover = (index: number, field: keyof NeedleMover, value: any) => {
    const updated = [...newNeedleMovers];
    updated[index] = { ...updated[index], [field]: value };
    setNewNeedleMovers(updated);
  };

  const removeNewNeedleMover = (index: number) => {
    setNewNeedleMovers(newNeedleMovers.filter((_, i) => i !== index));
  };

  const updatePriority = async (taskId: string, priority: string) => {
    await updateMutation.mutateAsync({
      taskId,
      priority: priority as "urgent" | "high" | "normal" | "low",
    });
  };

  const toggleComplete = (taskId: string) => {
    setCompletedTaskIds(prev => {
      if (prev.includes(taskId)) {
        // Unmark as complete
        return prev.filter(id => id !== taskId);
      } else {
        // Mark as complete
        return [...prev, taskId];
      }
    });
  };

  // Get current user's email to match with ClickUp assignee
  const currentUserEmail = user?.email;

  // Check if a task is assigned to current user
  const isAssignedToMe = (needleMover: NeedleMover) => {
    if (!currentUserEmail || !availableAssignees) return false;
    // For now, show confidence for all tasks assigned to anyone
    // The Monday check-in bot will handle assignee-specific confidence
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeTasks = existingNeedleMovers?.filter(nm => !completedTaskIds.includes(nm.id!) && !movedToRoadmapIds.includes(nm.id!)) || [];
  const completedTasksList = existingNeedleMovers?.filter(nm => completedTaskIds.includes(nm.id!)) || [];
  const movedToRoadmapList = existingNeedleMovers?.filter(nm => movedToRoadmapIds.includes(nm.id!)) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Weekly Business Needle Movers</h2>
        <p className="text-muted-foreground mt-2">
          Review existing needle movers and add new ones from your business planning.
        </p>
      </div>

      {/* Action Buttons at Top */}
      <div className="flex gap-3">
        <Button onClick={addNewNeedleMover} variant="default" className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Add New Needle Mover
        </Button>
        <Button 
          onClick={() => setShowCategorizationReview(true)} 
          variant="secondary"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          🤖 Auto-Categorize
        </Button>
      </div>

      {/* New Needle Movers */}
      {newNeedleMovers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>New Needle Movers ({newNeedleMovers.length})</CardTitle>
            <CardDescription>Will be saved to ClickUp when you complete planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newNeedleMovers.map((nm, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                {/* Trash icon in top-right */}
                <button
                  onClick={() => removeNewNeedleMover(index)}
                  className="absolute top-3 right-3 p-2 hover:bg-destructive/10 rounded-md transition-colors"
                  aria-label="Remove needle mover"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
                <div className="space-y-2">
                  <Label>Task Name *</Label>
                  <Input
                    placeholder="Enter needle mover name..."
                    value={nm.name}
                    onChange={(e) => updateNewNeedleMover(index, "name", e.target.value)}
                  />
                </div>

                {nm.description && (
                  <div className="text-sm text-muted-foreground">
                    {nm.description}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={nm.priority}
                      onValueChange={(value) => updateNewNeedleMover(index, "priority", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="normal">🔵 Normal</SelectItem>
                        <SelectItem value="low">⚪ Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select
                      key={`assignee-${index}-${nm.assigneeId || 'none'}`}
                      value={nm.assigneeId?.toString() || "unassigned"}
                      onValueChange={(value) => {
                        console.log('Assignee selected:', value);
                        if (value === "unassigned") {
                          const updated = [...newNeedleMovers];
                          updated[index] = { ...updated[index], assigneeId: undefined, assigneeName: undefined };
                          setNewNeedleMovers(updated);
                        } else {
                          const assignee = availableAssignees?.find(m => m.id.toString() === value);
                          console.log('Found assignee:', assignee);
                          if (assignee) {
                            const updated = [...newNeedleMovers];
                            updated[index] = { ...updated[index], assigneeId: assignee.id, assigneeName: assignee.username };
                            setNewNeedleMovers(updated);
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {availableAssignees?.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Confidence level will be filled by assignee in Monday check-in */}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    onClick={async () => {
                      // Validate that task name is filled
                      if (!nm.name || !nm.name.trim()) {
                        toast.error("Please enter a task name");
                        return;
                      }
                      // Create in ClickUp immediately
                      await createMutation.mutateAsync({
                        name: nm.name,
                        description: nm.description,
                        priority: nm.priority,
                        assigneeId: nm.assigneeId,
                      });
                      // Remove from new needle movers list
                      removeNewNeedleMover(index);
                    }}
                    disabled={createMutation.isPending}
                    className="flex-1"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Needle Movers */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Needle Movers ({activeTasks.length})</CardTitle>
            <CardDescription>From ClickUp - Update priorities or mark complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTasks.map((nm) => (
              <div
                key={nm.id}
                className="flex items-start justify-between p-4 border rounded-lg bg-card gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-2">{nm.name}</h4>
                  {(nm.linkedObjectiveName || nm.linkedKeyResultName) && (
                    <div className="mb-2">
                      <OKRBadge 
                        objectiveName={nm.linkedObjectiveName}
                        keyResultName={nm.linkedKeyResultName}
                        compact
                      />
                    </div>
                  )}
                  
                  {/* Manual OKR Linkage */}
                  {!nm.linkedObjectiveName && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-md">
                      <div className="text-xs font-medium mb-2">Link to OKR:</div>
                      {objectivesLoading ? (
                        <div className="text-sm text-muted-foreground">Loading objectives...</div>
                      ) : objectivesError ? (
                        <div className="text-sm text-destructive">Error loading objectives: {objectivesError.message}</div>
                      ) : !objectives || objectives.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No objectives found</div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          <Select
                            value={selectedObjectives[nm.id!] || ""}
                            onValueChange={(value) => {
                              setSelectedObjectives({ ...selectedObjectives, [nm.id!]: value });
                              // Clear key result when objective changes
                              setSelectedKeyResults({ ...selectedKeyResults, [nm.id!]: "" });
                            }}
                          >
                            <SelectTrigger className="h-8 w-48">
                              <SelectValue placeholder="Select Objective..." />
                            </SelectTrigger>
                            <SelectContent>
                              {objectives.map((obj) => (
                                <SelectItem key={obj.id} value={obj.id}>
                                  {obj.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedObjectives[nm.id!] && (
                            <Select
                              value={selectedKeyResults[nm.id!] || ""}
                              onValueChange={(value) => {
                                setSelectedKeyResults({ ...selectedKeyResults, [nm.id!]: value });
                              }}
                            >
                              <SelectTrigger className="h-8 w-48">
                                <SelectValue placeholder="Select Key Result..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getKeyResultsForObjective(selectedObjectives[nm.id!]).map((kr) => (
                                  <SelectItem key={kr.id} value={kr.id}>
                                    {kr.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {selectedKeyResults[nm.id!] && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleLinkOKR(nm.id!)}
                              disabled={linkOKRMutation.isPending}
                            >
                              {linkOKRMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Link"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                    {nm.assigneeName && (
                      <span className="font-medium">Assigned: {nm.assigneeName}</span>
                    )}
                    {nm.confidenceLevel !== undefined && (
                      <span>Confidence: {nm.confidenceLevel}/10</span>
                    )}
                    {nm.lastWeekConfidence !== undefined && nm.lastWeekConfidence !== null && (
                      <span>Last Week: {nm.lastWeekConfidence}/10</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Select
                    value={nm.assigneeId?.toString() || "unassigned"}
                    onValueChange={async (value) => {
                      const newAssigneeId = value === "unassigned" ? undefined : parseInt(value);
                      await updateMutation.mutateAsync({
                        taskId: nm.id!,
                        assigneeId: newAssigneeId,
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {availableAssignees?.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={editingPriorities[nm.id!] || nm.priority}
                    onValueChange={(value) => {
                      setEditingPriorities({ ...editingPriorities, [nm.id!]: value });
                      updatePriority(nm.id!, value);
                    }}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="normal">🔵 Normal</SelectItem>
                      <SelectItem value="low">⚪ Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveToRoadmapMutation.mutate({ taskId: nm.id! })}
                    disabled={moveToRoadmapMutation.isPending}
                    title="Move to Roadmap"
                  >
                    {moveToRoadmapMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>🗺️</span>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleComplete(nm.id!)}
                    title="Mark Complete"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Moved to Roadmap */}
      {movedToRoadmapList.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">
              Moved to Roadmap ({movedToRoadmapList.length})
            </CardTitle>
            <CardDescription>These tasks have been moved to your ClickUp Roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {movedToRoadmapList.map((nm) => (
              <div
                key={nm.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl flex-shrink-0">🗺️</span>
                  <div>
                    <h4 className="font-medium">{nm.name}</h4>
                    {nm.assigneeName && (
                      <p className="text-sm text-muted-foreground">Assigned: {nm.assigneeName}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setMovedToRoadmapIds(movedToRoadmapIds.filter(id => id !== nm.id));
                    toast.info("Task restored to Active list");
                  }}
                  className="flex-shrink-0"
                >
                  Undo
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Needle Movers */}
      {completedTasksList.length > 0 && (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              Completed This Week ({completedTasksList.length})
            </CardTitle>
            <CardDescription>Will be marked complete in ClickUp when you finish planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasksList.map((nm) => (
              <div
                key={nm.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium line-through">{nm.name}</h4>
                    {nm.assigneeName && (
                      <p className="text-sm text-muted-foreground">Assigned: {nm.assigneeName}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleComplete(nm.id!)}
                  className="flex-shrink-0"
                >
                  Undo
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Auto-Categorization Modal */}
      {showCategorizationReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TaskCategorizationReview onClose={() => {
              setShowCategorizationReview(false);
              refetch(); // Refresh to show updated OKR badges
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

