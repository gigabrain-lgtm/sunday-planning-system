import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

function Invoices() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { data: invoices, refetch } = trpc.invoices.list.useQuery();
  const { data: roles } = trpc.roles.list.useQuery();
  const createMutation = trpc.invoices.create.useMutation();
  const deleteMutation = trpc.invoices.delete.useMutation();

  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    transactionDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    invoiceNumber: '',
    invoicePdfUrl: '',
    roleId: '',
    location: '',
    jobId: '',
    adStartDate: '',
    adEndDate: '',
    totalFees: '',
    dailyFees: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roleId || !formData.location || !formData.adStartDate || !formData.adEndDate || !formData.totalFees || !formData.dailyFees) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(formData.adStartDate);
    const endDate = new Date(formData.adEndDate);
    const adDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    try {
      await createMutation.mutateAsync({
        ...formData,
        roleId: parseInt(formData.roleId),
        adDays,
        totalFees: Math.round(parseFloat(formData.totalFees) * 100),
        dailyFees: Math.round(parseFloat(formData.dailyFees) * 100),
      });
      
      toast.success("Invoice added successfully");
      setIsAddDialogOpen(false);
      setFormData({
        month: new Date().toISOString().slice(0, 7),
        transactionDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        invoiceNumber: '',
        invoicePdfUrl: '',
        roleId: '',
        location: '',
        jobId: '',
        adStartDate: '',
        adEndDate: '',
        totalFees: '',
        dailyFees: '',
      });
      refetch();
    } catch (error) {
      toast.error("Failed to add invoice");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Invoice deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Invoices</h1>
          <p className="text-muted-foreground">
            Track actual invoiced spending from LinkedIn
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add LinkedIn Invoice</DialogTitle>
              <DialogDescription>
                Enter invoice details from LinkedIn Transactions page
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="transactionDate">Transaction Date</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="invoicePdfUrl">Invoice PDF (Google Drive Link)</Label>
                <Input
                  id="invoicePdfUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.invoicePdfUrl}
                  onChange={(e) => setFormData({ ...formData, invoicePdfUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roleId">Role *</Label>
                  <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="jobId">LinkedIn Job ID</Label>
                <Input
                  id="jobId"
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adStartDate">Ad Start Date *</Label>
                  <Input
                    id="adStartDate"
                    type="date"
                    value={formData.adStartDate}
                    onChange={(e) => setFormData({ ...formData, adStartDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adEndDate">Ad End Date *</Label>
                  <Input
                    id="adEndDate"
                    type="date"
                    value={formData.adEndDate}
                    onChange={(e) => setFormData({ ...formData, adEndDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalFees">Total Fees ($) *</Label>
                  <Input
                    id="totalFees"
                    type="number"
                    step="0.01"
                    value={formData.totalFees}
                    onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dailyFees">Daily Fees ($) *</Label>
                  <Input
                    id="dailyFees"
                    type="number"
                    step="0.01"
                    value={formData.dailyFees}
                    onChange={(e) => setFormData({ ...formData, dailyFees: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Add Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            All invoices from LinkedIn Transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Ad Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Daily</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const role = roles?.find(r => r.id === invoice.roleId);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.month}</TableCell>
                        <TableCell>{formatDate(invoice.transactionDate)}</TableCell>
                        <TableCell>{invoice.invoiceNumber || '-'}</TableCell>
                        <TableCell>{role?.roleName || `Role #${invoice.roleId}`}</TableCell>
                        <TableCell>{invoice.location}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(invoice.adStartDate)} - {formatDate(invoice.adEndDate)}
                        </TableCell>
                        <TableCell>{invoice.adDays}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.totalFees)}</TableCell>
                        <TableCell>{formatCurrency(invoice.dailyFees)}</TableCell>
                        <TableCell>
                          {invoice.invoicePdfUrl ? (
                            <a href={invoice.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No invoices yet. Add your first invoice to start tracking.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <Invoices />
    </DashboardLayout>
  );
}
