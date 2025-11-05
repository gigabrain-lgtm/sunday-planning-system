import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function OKRReview() {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedKeyResults, setExpandedKeyResults] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Record<string, string>>({});
  const [strategicThinking, setStrategicThinking] = useState<Record<string, { lastWeek: string; learned: string; needle20: string }>>({});
  const [newTaskName, setNewTaskName] = useState<Record<string, string>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const { data: objectives, isLoading: loadingObjectives } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults, isLoading: loadingKeyResults, refetch: refetchKeyResults } = trpc.okr.fetchKeyResults.useQuery();
  
  const addSubtaskMutation = trpc.okr.addSubtask.useMutation({
    onSuccess: () => {
      toast.success("Task added successfully!");
      refetchKeyResults();
    },
    onError: (error: any) => {
      toast.error(`Failed to add task: ${error.message}`);
    },
  });

  const deleteSubtaskMutation = trpc.okr.deleteSubtask.useMutation({
    onSuccess: () => {
      toast.success("Task removed successfully!");
      refetchKeyResults();
    },
    onError: (error: any) => {
      toast.error(`Failed to remove task: ${error.message}`);
    },
  });

  const moveToNeedleMoversMutation = trpc.okr.moveToNeedleMovers.useMutation({
    onSuccess: () => {
      toast.success("✅ Task moved to Weekly Needle Movers!");
      refetchKeyResults();
    },
    onError: (error: any) => {
      toast.error(`Failed to move task: ${error.message}`);
    },
  });

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

  const handleAction = (subtaskId: string, action: string, keyResultId: string) => {
    setSelectedActions((prev) => ({ ...prev, [subtaskId]: action }));
    
    if (action === 'needle_mover') {
      // Actually move the task to Needle Movers list
      moveToNeedleMoversMutation.mutate({
        taskId: subtaskId,
        keyResultId: keyResultId,
      });
    } else {
      // For other actions, just show confirmation for now
      const actionLabels: Record<string, string> = {
        automate: "AUTOMATE",
        delegate: "DELEGATE",
        eliminate: "ELIMINATE",
        roadmap: "ROADMAP",
      };
      
      toast.success(`✓ Marked as: ${actionLabels[action]}`);
    }
  };

  const handleAddSubtask = (keyResultId: string) => {
    const taskName = newTaskName[keyResultId]?.trim();
    if (!taskName) {
      toast.error("Please enter a task name");
      return;
    }

    addSubtaskMutation.mutate({
      parentId: keyResultId,
      name: taskName,
    });

    // Clear input
    setNewTaskName((prev) => ({ ...prev, [keyResultId]: "" }));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (confirm("Are you sure you want to remove this task?")) {
      deleteSubtaskMutation.mutate({ taskId: subtaskId });
    }
  };

  const updateStrategicThinking = (keyResultId: string, field: string, value: string) => {
    setStrategicThinking((prev) => ({
      ...prev,
      [keyResultId]: {
        ...prev[keyResultId],
        [field]: value,
      },
    }));
  };

  if (loadingObjectives || loadingKeyResults) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Department mapping
  const departmentMap: Record<string, { name: string; color: string }> = {
    "1": { name: "Finance", color: "bg-green-100 text-green-700 border-green-300" },
    "2": { name: "Operations", color: "bg-blue-100 text-blue-700 border-blue-300" },
    "3": { name: "Marketing/Sales", color: "bg-purple-100 text-purple-700 border-purple-300" },
    "4": { name: "IT Team", color: "bg-orange-100 text-orange-700 border-orange-300" },
  };

  // Filter objectives by selected department
  const filteredObjectives = objectives?.filter((obj: any) => {
    if (selectedDepartment === 'all') return true;
    return obj.department === selectedDepartment;
  }) || [];

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

      {/* Department Filter Bar */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button
          onClick={() => setSelectedDepartment('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedDepartment === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Departments
        </button>
        <button
          onClick={() => setSelectedDepartment('1')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedDepartment === '1'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          💰 Finance
        </button>
        <button
          onClick={() => setSelectedDepartment('2')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedDepartment === '2'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          ⚙️ Operations
        </button>
        <button
          onClick={() => setSelectedDepartment('3')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedDepartment === '3'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          📈 Marketing/Sales
        </button>
        <button
          onClick={() => setSelectedDepartment('4')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedDepartment === '4'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          💻 IT Team
        </button>
      </div>

      {filteredObjectives?.map((objective: any) => {
        const isExpanded = expandedObjectives.has(objective.id);
        // Filter key results that belong to this objective
        const objectiveKeyResults = keyResults?.filter((kr: any) => 
          kr.objectiveIds?.includes(objective.id)
        ) || [];
        
        const department = departmentMap[objective.department] || { name: "No Department", color: "bg-gray-100 text-gray-700 border-gray-300" };

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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{objective.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded border ${department.color}`}>
                      {department.name}
                    </span>
                  </div>
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
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-md">Key Results</h4>

                {objectiveKeyResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No key results for this objective</p>
                ) : (
                  objectiveKeyResults.map((kr: any) => {
                    const isKRExpanded = expandedKeyResults.has(kr.id);
                    
                    return (
                      <div
                        key={kr.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                      >
                        <button
                          onClick={() => toggleKeyResult(kr.id)}
                          className="w-full flex items-start justify-between text-left"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium">{kr.name}</h5>
                            <p className="text-sm text-muted-foreground mt-1">{kr.description}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            {isKRExpanded ? "▼" : "▶"}
                          </Button>
                        </button>

                        {isKRExpanded && (
                          <div className="mt-4 space-y-6">
                            {/* Strategic Thinking Section */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                              <h6 className="font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2 mb-4">
                                <span>💡</span> Strategic Thinking
                              </h6>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-yellow-900 dark:text-yellow-100 block mb-2">
                                    • What did we do last week toward this key result?
                                  </label>
                                  <Textarea
                                    value={strategicThinking[kr.id]?.lastWeek || ""}
                                    onChange={(e) => updateStrategicThinking(kr.id, "lastWeek", e.target.value)}
                                    placeholder="Reflect on last week's progress..."
                                    className="bg-white dark:bg-gray-800"
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-yellow-900 dark:text-yellow-100 block mb-2">
                                    • What did we learn?
                                  </label>
                                  <Textarea
                                    value={strategicThinking[kr.id]?.learned || ""}
                                    onChange={(e) => updateStrategicThinking(kr.id, "learned", e.target.value)}
                                    placeholder="Key learnings and insights..."
                                    className="bg-white dark:bg-gray-800"
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-yellow-900 dark:text-yellow-100 block mb-2">
                                    • What's the 20% of actions that will move the needle most?
                                  </label>
                                  <Textarea
                                    value={strategicThinking[kr.id]?.needle20 || ""}
                                    onChange={(e) => updateStrategicThinking(kr.id, "needle20", e.target.value)}
                                    placeholder="Identify the highest-impact actions..."
                                    className="bg-white dark:bg-gray-800"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Add New Task Section */}
                            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                              <div className="flex gap-2">
                                <Input
                                  value={newTaskName[kr.id] || ""}
                                  onChange={(e) => setNewTaskName((prev) => ({ ...prev, [kr.id]: e.target.value }))}
                                  placeholder="Add a new task based on your strategic thinking..."
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddSubtask(kr.id);
                                    }
                                  }}
                                />
                                <Button
                                  onClick={() => handleAddSubtask(kr.id)}
                                  disabled={addSubtaskMutation.isPending}
                                  size="sm"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Task
                                </Button>
                              </div>
                            </div>

                            {/* Tasks to Prioritize Section */}
                            <div>
                              <h6 className="font-semibold mb-3">Tasks to prioritize:</h6>
                              
                              {kr.subtasks && kr.subtasks.length > 0 ? (
                                <div className="space-y-4">
                                  {kr.subtasks.map((subtask: any) => {
                                    const selectedAction = selectedActions[subtask.id];
                                    
                                    return (
                                      <div
                                        key={subtask.id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <p className="font-medium flex-1">{subtask.name}</p>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteSubtask(subtask.id)}
                                            disabled={deleteSubtaskMutation.isPending}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-3">Choose an action:</p>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                          <Button
                                            variant={selectedAction === "needle_mover" ? "default" : "outline"}
                                            onClick={() => handleAction(subtask.id, "needle_mover", kr.id)}
                                            className="justify-start"
                                            disabled={moveToNeedleMoversMutation.isPending}
                                          >
                                            <span className="mr-2">✓</span> This Week
                                          </Button>
                                          
                                          <Button
                                            variant={selectedAction === "automate" ? "default" : "outline"}
                                            onClick={() => handleAction(subtask.id, "automate", kr.id)}
                                            className="justify-start"
                                          >
                                            <span className="mr-2">🤖</span> Automate
                                          </Button>
                                          
                                          <Button
                                            variant={selectedAction === "delegate" ? "default" : "outline"}
                                            onClick={() => handleAction(subtask.id, "delegate", kr.id)}
                                            className="justify-start"
                                          >
                                            <span className="mr-2">👥</span> Delegate
                                          </Button>
                                          
                                          <Button
                                            variant={selectedAction === "eliminate" ? "default" : "outline"}
                                            onClick={() => handleAction(subtask.id, "eliminate", kr.id)}
                                            className="justify-start"
                                          >
                                            <span className="mr-2">❌</span> Eliminate
                                          </Button>
                                          
                                          <Button
                                            variant={selectedAction === "roadmap" ? "default" : "outline"}
                                            onClick={() => handleAction(subtask.id, "roadmap", kr.id)}
                                            className="justify-start col-span-2"
                                          >
                                            <span className="mr-2">🗺️</span> Roadmap
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No tasks yet. Add tasks above based on your strategic thinking.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

