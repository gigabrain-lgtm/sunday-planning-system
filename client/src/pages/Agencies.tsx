import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, Building2, X, Check } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Agencies() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slackChannelId: "",
    contactEmail: "",
    notes: "",
  });

  const { data: agencies, isLoading, refetch } = trpc.agencies.getAll.useQuery();

  const createMutation = trpc.agencies.create.useMutation({
    onSuccess: () => {
      toast.success("Agency added successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add agency: ${error.message}`);
    },
  });

  const updateMutation = trpc.agencies.update.useMutation({
    onSuccess: () => {
      toast.success("Agency updated successfully!");
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update agency: ${error.message}`);
    },
  });

  const deleteMutation = trpc.agencies.delete.useMutation({
    onSuccess: () => {
      toast.success("Agency deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete agency: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slackChannelId: "",
      contactEmail: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (agency: any) => {
    setEditingId(agency.id);
    setFormData({
      name: agency.name,
      slackChannelId: agency.slackChannelId,
      contactEmail: agency.contactEmail || "",
      notes: agency.notes || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this agency?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
              <p className="text-muted-foreground mt-1">
                Manage agencies and their Slack notification channels
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); resetForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agency
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Agency" : "Add New Agency"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId 
                      ? "Update agency information and Slack channel"
                      : "Add a new agency to receive content review notifications"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Agency Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Acme Marketing"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slackChannelId">
                      Slack Channel ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="slackChannelId"
                      placeholder="e.g., C01234ABCDE"
                      value={formData.slackChannelId}
                      onChange={(e) => setFormData({ ...formData, slackChannelId: e.target.value })}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Find this in Slack: Right-click channel → View channel details → Copy Channel ID
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">
                      Contact Email (Optional)
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@agency.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about this agency..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                    >
                      {(createMutation.isLoading || updateMutation.isLoading) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {editingId ? "Update" : "Add"} Agency
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : agencies && agencies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agencies.map((agency) => (
                <Card key={agency.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {agency.name}
                    </CardTitle>
                    <CardDescription>
                      Channel: {agency.slackChannelId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agency.contactEmail && (
                      <p className="text-sm text-gray-600 mb-2">
                        📧 {agency.contactEmail}
                      </p>
                    )}
                    {agency.notes && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {agency.notes}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(agency)}
                        className="flex-1"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(agency.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agencies yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Add your first agency to start receiving Slack notifications for content reviews
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Agency
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
