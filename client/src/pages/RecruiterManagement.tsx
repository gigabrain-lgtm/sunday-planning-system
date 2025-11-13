import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Pencil, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RecruiterManagement() {
  const { data: recruiters, refetch } = trpc.hiring.recruiters.list.useQuery();
  const [editDialog, setEditDialog] = useState<{ open: boolean; recruiter?: any }>({ open: false });
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editSlack, setEditSlack] = useState("");

  const updateMutation = trpc.hiring.recruiters.update.useMutation({
    onSuccess: () => {
      toast.success("Recruiter updated successfully");
      refetch();
      setEditDialog({ open: false });
    },
    onError: (error) => {
      toast.error(`Failed to update recruiter: ${error.message}`);
    },
  });

  const handleEdit = (recruiter: any) => {
    setEditName(recruiter.name);
    setEditCode(recruiter.recruiterCode);
    setEditSlack(recruiter.slackChannelId);
    setEditDialog({ open: true, recruiter });
  };

  const handleSave = () => {
    if (!editDialog.recruiter) return;
    
    updateMutation.mutate({
      id: editDialog.recruiter.id,
      name: editName,
      recruiterCode: editCode.toUpperCase(),
      slackChannelId: editSlack,
    });
  };

  return (
    <Sidebar>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recruiter Management</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recruiter
          </Button>
        </div>

        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slack Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recruiters?.map((recruiter) => (
                <tr key={recruiter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{recruiter.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{recruiter.recruiterCode}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recruiter.slackChannelId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {recruiter.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(recruiter)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Recruiter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label>Code</Label>
                <Input value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())} />
              </div>
              <div>
                <Label>Slack Channel ID</Label>
                <Input value={editSlack} onChange={(e) => setEditSlack(e.target.value)} />
              </div>
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
