import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function HiringPriorities() {
  const { data: priorities, refetch } = trpc.hiring.priorities.list.useQuery();
  const [createDialog, setCreateDialog] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"urgent" | "high" | "medium" | "normal" | "low" | "inactive">("normal");

  const createMutation = trpc.hiring.priorities.create.useMutation({
    onSuccess: () => {
      toast.success("Priority created successfully");
      refetch();
      setCreateDialog(false);
      setJobTitle("");
      setDescription("");
      setPriority("normal");
    },
    onError: (error) => {
      toast.error(`Failed to create priority: ${error.message}`);
    },
  });

  const updateMutation = trpc.hiring.priorities.update.useMutation({
    onSuccess: () => {
      toast.success("Priority updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update priority: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!jobTitle.trim()) {
      toast.error("Job title is required");
      return;
    }
    createMutation.mutate({ jobTitle, description, priority });
  };

  const handlePriorityChange = (id: number, newPriority: string) => {
    updateMutation.mutate({
      id,
      priority: newPriority as "urgent" | "high" | "medium" | "normal" | "low" | "inactive",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      case "inactive": return "bg-gray-50 text-gray-500 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const stats = {
    urgent: priorities?.filter(p => p.priority === "urgent").length || 0,
    high: priorities?.filter(p => p.priority === "high").length || 0,
    medium: priorities?.filter(p => p.priority === "medium").length || 0,
    normal: priorities?.filter(p => p.priority === "normal").length || 0,
  };

  return (
    <Sidebar>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hiring Priorities</h1>
            <p className="text-gray-500 mt-1">Manage priority levels for different job titles</p>
          </div>
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Priority
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4 bg-white shadow-sm border-l-4 border-l-red-500">
            <p className="text-sm text-gray-500">Urgent</p>
            <p className="text-3xl font-bold mt-1">{stats.urgent}</p>
          </div>
          <div className="border rounded-lg p-4 bg-white shadow-sm border-l-4 border-l-orange-500">
            <p className="text-sm text-gray-500">High</p>
            <p className="text-3xl font-bold mt-1">{stats.high}</p>
          </div>
          <div className="border rounded-lg p-4 bg-white shadow-sm border-l-4 border-l-yellow-500">
            <p className="text-sm text-gray-500">Medium</p>
            <p className="text-3xl font-bold mt-1">{stats.medium}</p>
          </div>
          <div className="border rounded-lg p-4 bg-white shadow-sm border-l-4 border-l-blue-500">
            <p className="text-sm text-gray-500">Normal</p>
            <p className="text-3xl font-bold mt-1">{stats.normal}</p>
          </div>
        </div>

        {/* Priorities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priorities?.map((item) => (
            <div key={item.id} className={`border-2 rounded-lg p-4 bg-white shadow-sm ${getPriorityColor(item.priority)}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.jobTitle}</h3>
                <Select value={item.priority} onValueChange={(value) => handlePriorityChange(item.id, value)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Hiring Priority</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Job Title</Label>
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Developer" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div>
                <Label>Priority Level</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Priority</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
