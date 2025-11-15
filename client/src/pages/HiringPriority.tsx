import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PriorityLevel = "urgent" | "high" | "medium" | "normal" | "low" | "inactive";

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  urgent: "bg-red-500 hover:bg-red-600",
  high: "bg-orange-500 hover:bg-orange-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  normal: "bg-blue-500 hover:bg-blue-600",
  low: "bg-gray-500 hover:bg-gray-600",
  inactive: "bg-gray-400 hover:bg-gray-500",
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

interface RoleFormData {
  jobTitle: string;
  description: string;
  priority: PriorityLevel;
  jobDescription: string;
  testQuestions: string;
  interviewQuestions: string;
}

export default function HiringPriority() {
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<number | null>(null); // null = Master
  
  const { data: priorities, isLoading: prioritiesLoading } = trpc.hiringPriorities.list.useQuery({ recruiterId: selectedRecruiterId });
  const { data: jobAssignments, isLoading: assignmentsLoading } = trpc.jobAssignments.list.useQuery();
  const { data: recruiters } = trpc.recruiters.list.useQuery();
  
  const createPriorityMutation = trpc.hiringPriorities.create.useMutation();
  const updatePriorityMutation = trpc.hiringPriorities.update.useMutation();
  const deletePriorityMutation = trpc.hiringPriorities.delete.useMutation();
  const utils = trpc.useUtils();

  const [editingJobTitle, setEditingJobTitle] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<RoleFormData>({
    jobTitle: "",
    description: "",
    priority: "normal",
    jobDescription: "",
    testQuestions: "",
    interviewQuestions: "",
  });

  // Get agencies assigned to a job title
  const getAgencies = (jobTitle: string): string[] => {
    if (!jobAssignments) return [];
    
    const assignments = jobAssignments.filter((ja) => ja.jobTitle === jobTitle);
    if (assignments.length === 0) return [];
    
    const uniqueAgencies = Array.from(new Set(assignments.map((ja) => ja.agencyName)));
    return uniqueAgencies;
  };

  // Handle priority change (inline editing)
  const handlePriorityChange = async (jobTitle: string, newPriority: PriorityLevel) => {
    try {
      const existingPriority = priorities?.find((p) => p.jobTitle === jobTitle);
      
      if (existingPriority) {
        // Update existing priority
        await updatePriorityMutation.mutateAsync({
          id: existingPriority.id,
          priority: newPriority,
        });
      } else {
        // Create new priority
        await createPriorityMutation.mutateAsync({
          jobTitle,
          priority: newPriority,
        });
      }
      
      await utils.hiringPriorities.list.invalidate();
      toast.success("Priority updated successfully");
      setEditingJobTitle(null);
    } catch (error) {
      toast.error("Failed to update priority");
      console.error(error);
    }
  };

  // Open dialog for adding new role
  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({
      jobTitle: "",
      description: "",
      priority: "normal",
      jobDescription: "",
      testQuestions: "",
      interviewQuestions: "",
    });
    setIsDialogOpen(true);
  };

  // Open dialog for editing existing role
  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setFormData({
      jobTitle: role.jobTitle || "",
      description: role.description || "",
      priority: role.priority || "normal",
      jobDescription: role.jobDescription || "",
      testQuestions: role.testQuestions || "",
      interviewQuestions: role.interviewQuestions || "",
    });
    setIsDialogOpen(true);
  };

  // Save role (create or update)
  const handleSaveRole = async () => {
    try {
      if (!formData.jobTitle.trim()) {
        toast.error("Job title is required");
        return;
      }

      if (editingRole) {
        // Update existing role
        await updatePriorityMutation.mutateAsync({
          id: editingRole.id,
          ...formData,
          recruiterId: selectedRecruiterId,
        });
        toast.success("Role updated successfully");
      } else {
        // Create new role
        await createPriorityMutation.mutateAsync({
          ...formData,
          recruiterId: selectedRecruiterId,
        });
        toast.success("Role added successfully");
      }

      await utils.hiringPriorities.list.invalidate();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save role");
      console.error(error);
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;

    try {
      await deletePriorityMutation.mutateAsync({ id: deleteRoleId });
      await utils.hiringPriorities.list.invalidate();
      toast.success("Role deleted successfully");
      setDeleteRoleId(null);
    } catch (error) {
      toast.error("Failed to delete role");
      console.error(error);
    }
  };

  const isLoading = prioritiesLoading || assignmentsLoading;

  // Sort priorities by priority order
  const sortedPriorities = [...(priorities || [])].sort((a, b) => {
    const priorityA = a.priority as PriorityLevel;
    const priorityB = b.priority as PriorityLevel;
    return PRIORITY_ORDER[priorityA] - PRIORITY_ORDER[priorityB];
  });

  // Split into active and inactive
  const activeRoles = sortedPriorities.filter((role) => role.priority !== "inactive");
  const inactiveRoles = sortedPriorities.filter((role) => role.priority === "inactive");

  return (
    <Sidebar>
      <div className="container mx-auto py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hiring Priority</h1>
          <p className="text-muted-foreground">
            Manage priority levels for job titles across all agencies
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recruiter-select" className="text-sm text-muted-foreground">View List:</Label>
            <Select value={selectedRecruiterId === null ? "master" : String(selectedRecruiterId)} onValueChange={(value) => setSelectedRecruiterId(value === "master" ? null : Number(value))}>
              <SelectTrigger id="recruiter-select" className="w-[200px]">
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="master">🌟 Master List</SelectItem>
                {recruiters?.map((recruiter) => (
                  <SelectItem key={recruiter.id} value={String(recruiter.id)}>
                    {recruiter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddRole}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Active Priority Roles */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Priority Roles</h2>
          <p className="text-sm text-muted-foreground">
            Track which job titles are most urgent to fill
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold">Agency</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRoles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      No active priority roles. Click "Add Role" to get started.
                    </td>
                  </tr>
                ) : (
                  activeRoles.map((role) => {
                    const priority = role.priority as PriorityLevel;
                    const agencies = getAgencies(role.jobTitle);
                    const isEditing = editingJobTitle === role.jobTitle;

                    return (
                      <tr key={role.id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4 font-medium">{role.jobTitle}</td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <Select
                              value={priority}
                              onValueChange={(value) => handlePriorityChange(role.jobTitle, value as PriorityLevel)}
                            >
                              <SelectTrigger className="w-[180px] border-yellow-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="urgent">{PRIORITY_LABELS.urgent}</SelectItem>
                                <SelectItem value="high">{PRIORITY_LABELS.high}</SelectItem>
                                <SelectItem value="medium">{PRIORITY_LABELS.medium}</SelectItem>
                                <SelectItem value="normal">{PRIORITY_LABELS.normal}</SelectItem>
                                <SelectItem value="low">{PRIORITY_LABELS.low}</SelectItem>
                                <SelectItem value="inactive">{PRIORITY_LABELS.inactive}</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              className={`${PRIORITY_COLORS[priority]} cursor-pointer`}
                              onClick={() => setEditingJobTitle(role.jobTitle)}
                            >
                              {PRIORITY_LABELS[priority]}
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {agencies.length === 0 ? (
                            <span>-</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {agencies.map((agency, idx) => (
                                <div key={idx}>{agency}</div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteRoleId(role.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inactive Roles */}
      {inactiveRoles.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Inactive Roles</h2>
            <p className="text-sm text-muted-foreground">
              Job titles that are not currently being hired for
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold">Agency</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactiveRoles.map((role) => {
                  const priority = role.priority as PriorityLevel;
                  const agencies = getAgencies(role.jobTitle);
                  const isEditing = editingJobTitle === role.jobTitle;

                  return (
                    <tr key={role.id} className="border-b hover:bg-muted/50 opacity-60">
                      <td className="py-4 px-4 font-medium">{role.jobTitle}</td>
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <Select
                            value={priority}
                            onValueChange={(value) => handlePriorityChange(role.jobTitle, value as PriorityLevel)}
                          >
                            <SelectTrigger className="w-[180px] border-yellow-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urgent">{PRIORITY_LABELS.urgent}</SelectItem>
                              <SelectItem value="high">{PRIORITY_LABELS.high}</SelectItem>
                              <SelectItem value="medium">{PRIORITY_LABELS.medium}</SelectItem>
                              <SelectItem value="normal">{PRIORITY_LABELS.normal}</SelectItem>
                              <SelectItem value="low">{PRIORITY_LABELS.low}</SelectItem>
                              <SelectItem value="inactive">{PRIORITY_LABELS.inactive}</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            className={`${PRIORITY_COLORS[priority]} cursor-pointer`}
                            onClick={() => setEditingJobTitle(role.jobTitle)}
                          >
                            {PRIORITY_LABELS[priority]}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {agencies.length === 0 ? (
                          <span>-</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {agencies.map((agency, idx) => (
                              <div key={idx}>{agency}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteRoleId(role.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "Update role details including JD, test questions, and interview questions" : "Add a new role with priority level and detailed information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as PriorityLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">{PRIORITY_LABELS.urgent}</SelectItem>
                  <SelectItem value="high">{PRIORITY_LABELS.high}</SelectItem>
                  <SelectItem value="medium">{PRIORITY_LABELS.medium}</SelectItem>
                  <SelectItem value="normal">{PRIORITY_LABELS.normal}</SelectItem>
                  <SelectItem value="low">{PRIORITY_LABELS.low}</SelectItem>
                  <SelectItem value="inactive">{PRIORITY_LABELS.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the role"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description (JD)</Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder="Full job description with responsibilities, requirements, etc."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testQuestions">Test Questions</Label>
              <Textarea
                id="testQuestions"
                value={formData.testQuestions}
                onChange={(e) => setFormData({ ...formData, testQuestions: e.target.value })}
                placeholder="Assessment questions for candidates"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewQuestions">Interview Questions</Label>
              <Textarea
                id="interviewQuestions"
                value={formData.interviewQuestions}
                onChange={(e) => setFormData({ ...formData, interviewQuestions: e.target.value })}
                placeholder="Questions to ask during interviews"
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole ? "Update Role" : "Add Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteRoleId !== null} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this role. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </Sidebar>
  );
}
