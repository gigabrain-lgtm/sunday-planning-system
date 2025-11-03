import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Briefcase, AlertCircle, Plus, Trash2, ExternalLink, Check, X } from "lucide-react";
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

const priorityMap: Record<string, number> = {
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-500",
};

export function HiringPriorities() {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePriority, setNewRolePriority] = useState("normal");
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");

  const { data: priorities, isLoading, error, refetch } = trpc.hiring.fetchPriorities.useQuery();
  const updateMutation = trpc.hiring.updatePriority.useMutation({
    onSuccess: () => {
      toast.success("Priority updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const createMutation = trpc.hiring.createPriority.useMutation({
    onSuccess: () => {
      toast.success("Role added successfully");
      setNewRoleName("");
      setNewRolePriority("normal");
      setIsAddingRole(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add role: ${error.message}`);
    },
  });

  const deleteMutation = trpc.hiring.deletePriority.useMutation({
    onSuccess: () => {
      toast.success("Role removed successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    },
  });

  const handlePriorityChange = async (taskId: string, newPriority: string) => {
    await updateMutation.mutateAsync({
      taskId,
      priority: priorityMap[newPriority],
    });
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    await createMutation.mutateAsync({
      name: newRoleName,
      priority: priorityMap[newRolePriority],
    });
  };

  const handleDeleteRole = async (taskId: string, roleName: string) => {
    if (confirm(`Are you sure you want to remove "${roleName}"?`)) {
      await deleteMutation.mutateAsync({ taskId });
    }
  };

  const startEditingNote = (taskId: string, currentNote: string) => {
    setEditingNoteId(taskId);
    setEditingNoteValue(currentNote === "-" ? "" : currentNote);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteValue("");
  };

  const saveNote = async (taskId: string) => {
    try {
      // Update the description field in ClickUp (which maps to Note)
      await updateMutation.mutateAsync({
        taskId,
        description: editingNoteValue.trim(),
      });
      setEditingNoteId(null);
      setEditingNoteValue("");
    } catch (error) {
      // Error already handled by mutation
    }
  };

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

  const sortedPriorities = [...(priorities || [])].sort((a, b) => {
    const priorityOrder: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
    const aPriority = priorityOrder[a.priority?.priority?.toLowerCase() || "normal"] || 3;
    const bPriority = priorityOrder[b.priority?.priority?.toLowerCase() || "normal"] || 3;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });

  const getNote = (priority: HiringPriority) => {
    return priority.customFields?.Note || priority.customFields?.note || "-";
  };

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
        {/* Add New Role Section */}
        {isAddingRole ? (
          <div className="mb-6 p-4 border rounded-lg bg-accent/50">
            <h3 className="font-semibold mb-3">Add New Role</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Role name (e.g., Senior Developer)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddRole();
                  }
                }}
              />
              <Select value={newRolePriority} onValueChange={setNewRolePriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddRole}
                disabled={createMutation.isPending}
                size="sm"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsAddingRole(false);
                  setNewRoleName("");
                  setNewRolePriority("normal");
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingRole(true)}
            variant="outline"
            size="sm"
            className="mb-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        )}

        {/* Table Header */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-4 font-semibold text-sm border-b">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-4">Note</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {!priorities || priorities.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No hiring priorities found</p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedPriorities.map((priority) => (
                <div
                  key={priority.id}
                  className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-accent/50 transition-colors"
                >
                  {/* Name */}
                  <div className="col-span-5">
                    <div className="font-medium">{priority.name}</div>
                    {priority.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {priority.description}
                      </div>
                    )}
                  </div>

                  {/* Priority Dropdown */}
                  <div className="col-span-2">
                    <Select
                      value={priority.priority?.priority?.toLowerCase() || "normal"}
                      onValueChange={(value) => handlePriorityChange(priority.id, value)}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              priorityColors[priority.priority?.priority?.toLowerCase() || "normal"]
                            }`}
                          />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Urgent
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="normal">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Normal
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            Low
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note - Editable */}
                  <div className="col-span-4">
                    {editingNoteId === priority.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingNoteValue}
                          onChange={(e) => setEditingNoteValue(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Add note..."
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveNote(priority.id);
                            } else if (e.key === "Escape") {
                              cancelEditingNote();
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => saveNote(priority.id)}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={cancelEditingNote}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 px-2 py-1 rounded"
                        onClick={() => startEditingNote(priority.id, getNote(priority))}
                      >
                        {getNote(priority)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        window.open(`https://app.clickup.com/t/${priority.id}`, "_blank");
                      }}
                      title="View in ClickUp"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRole(priority.id, priority.name)}
                      disabled={deleteMutation.isPending}
                      title="Remove role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh Priorities"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
