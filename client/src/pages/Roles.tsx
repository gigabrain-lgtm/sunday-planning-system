import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Roles() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    technicalInterviewer: string;
    finalInterviewer: string;
  }>({ technicalInterviewer: "", finalInterviewer: "" });
  
  const { data: roles, isLoading } = trpc.roles.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.roles.create.useMutation({
    onSuccess: () => {
      utils.roles.list.invalidate();
      setIsCreateOpen(false);
      toast.success("Role created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create role: ${error.message}`);
    },
  });

  const updateMutation = trpc.roles.update.useMutation({
    onSuccess: () => {
      utils.roles.list.invalidate();
      setEditingRole(null);
      toast.success("Interviewers updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const deleteMutation = trpc.roles.delete.useMutation({
    onSuccess: () => {
      utils.roles.list.invalidate();
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete role: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      roleName: formData.get("roleName") as string,
      description: formData.get("description") as string || undefined,
    });
  };

  const handleDelete = (id: number, roleName: string) => {
    if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const startEditing = (role: any) => {
    setEditingRole(role.id);
    setEditValues({
      technicalInterviewer: role.technicalInterviewer || "",
      finalInterviewer: role.finalInterviewer || "",
    });
  };

  const saveInterviewers = (roleId: number) => {
    updateMutation.mutate({
      id: roleId,
      technicalInterviewer: editValues.technicalInterviewer || undefined,
      finalInterviewer: editValues.finalInterviewer || undefined,
    });
  };

  const cancelEditing = () => {
    setEditingRole(null);
    setEditValues({ technicalInterviewer: "", finalInterviewer: "" });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roles & Interview Assignments</h1>
            <p className="text-muted-foreground mt-1">
              Manage hiring roles and assign technical and final interviewers
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Add a new hiring role to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name *</Label>
                    <Input
                      id="roleName"
                      name="roleName"
                      placeholder="e.g., Amazon Account Manager"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of the role"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Role
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Roles</CardTitle>
            <CardDescription>
              Assign technical and final interviewers for each role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!roles || roles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No roles found. Create your first role to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[200px]">Technical Interviewer</TableHead>
                      <TableHead className="w-[200px]">Final Interviewer</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.roleName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.description || "-"}
                        </TableCell>
                        <TableCell>
                          {editingRole === role.id ? (
                            <Input
                              value={editValues.technicalInterviewer}
                              onChange={(e) => setEditValues(prev => ({ 
                                ...prev, 
                                technicalInterviewer: e.target.value 
                              }))}
                              placeholder="Enter name"
                              className="h-8"
                            />
                          ) : (
                            <span className="text-sm">
                              {role.technicalInterviewer || (
                                <span className="text-muted-foreground italic">Not assigned</span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRole === role.id ? (
                            <Input
                              value={editValues.finalInterviewer}
                              onChange={(e) => setEditValues(prev => ({ 
                                ...prev, 
                                finalInterviewer: e.target.value 
                              }))}
                              placeholder="Enter name"
                              className="h-8"
                            />
                          ) : (
                            <span className="text-sm">
                              {role.finalInterviewer || (
                                <span className="text-muted-foreground italic">Not assigned</span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingRole === role.id ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveInterviewers(role.id)}
                                  disabled={updateMutation.isPending}
                                >
                                  {updateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(role)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(role.id, role.roleName)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
