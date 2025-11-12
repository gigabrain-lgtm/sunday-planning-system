import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, ExternalLink, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PaymentRequestsAdmin() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);

  const { data: requests, isLoading, refetch } = trpc.paymentRequest.getAll.useQuery();

  const approveMutation = trpc.paymentRequest.approve.useMutation({
    onSuccess: (data) => {
      toast.success(`Payment request approved! ClickUp task created: ${data.clickupTaskId}`);
      refetch();
      setDetailsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve payment request");
    },
  });

  const rejectMutation = trpc.paymentRequest.reject.useMutation({
    onSuccess: () => {
      toast.success("Payment request rejected");
      refetch();
      setDetailsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject payment request");
    },
  });

  const updateMutation = trpc.paymentRequest.update.useMutation({
    onSuccess: () => {
      toast.success("Payment request updated");
      refetch();
      setEditOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update payment request");
    },
  });

  const handleApprove = (id: number) => {
    setPendingApprovalId(id);
    setReceiptImage(null);
    setReceiptDialogOpen(true);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setReceiptImage(event.target?.result as string);
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmApproval = () => {
    if (!receiptImage || !pendingApprovalId) {
      toast.error("Please paste or upload a receipt image");
      return;
    }

    approveMutation.mutate({
      id: pendingApprovalId,
      receiptImage,
      receiptFileName: `receipt-${pendingApprovalId}-${Date.now()}.png`,
    });

    setReceiptDialogOpen(false);
    setReceiptImage(null);
    setPendingApprovalId(null);
  };

  const handleEdit = (request: any) => {
    setSelectedRequest(request);
    setEditAmount(request.amount || "");
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRequest) return;
    updateMutation.mutate({
      id: selectedRequest.id,
      amount: editAmount,
    });
  };

  const handleReject = (id: number) => {
    if (confirm("Are you sure you want to reject this payment request?")) {
      rejectMutation.mutate({ id });
    }
  };

  const viewDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPaymentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payment Requests Admin</h1>
            <p className="text-gray-600 mt-2">Review and approve payment requests</p>
          </div>

          {!requests || requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <p className="text-gray-500">No payment requests found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request: any) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.submitterName || request.userName || "Guest"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {request.amount || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPaymentType(request.paymentType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewDetails(request)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {request.status === "approved" && request.clickupTaskId && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://app.clickup.com/t/${request.clickupTaskId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Task
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>
              Review the payment information submitted
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Request ID</p>
                  <p className="text-sm text-gray-900">#{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitter</p>
                  <p className="text-sm text-gray-900">{selectedRequest.submitterName || selectedRequest.userName || "Guest"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm text-gray-900 font-semibold">{selectedRequest.amount || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{selectedRequest.submitterEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Type</p>
                  <p className="text-sm text-gray-900">{formatPaymentType(selectedRequest.paymentType)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                {selectedRequest.approvedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.approvedAt)}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
                
                {selectedRequest.paymentType === "credit_card" && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Link</p>
                      <a href={selectedRequest.paymentLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {selectedRequest.paymentLink}
                      </a>
                    </div>
                    {selectedRequest.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.description}</p>
                      </div>
                    )}
                    {selectedRequest.dueDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="text-sm text-gray-900">{selectedRequest.dueDate}</p>
                      </div>
                    )}
                    {selectedRequest.serviceStartDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Service Start Date</p>
                        <p className="text-sm text-gray-900">{selectedRequest.serviceStartDate}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedRequest.paymentType === "ach" && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bank Name</p>
                      <p className="text-sm text-gray-900">{selectedRequest.achBankName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bank Address</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.achBankAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Routing Number</p>
                        <p className="text-sm text-gray-900">{selectedRequest.achRoutingNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <p className="text-sm text-gray-900">{selectedRequest.achAccountNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Type</p>
                        <p className="text-sm text-gray-900 capitalize">{selectedRequest.achAccountType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Holder</p>
                        <p className="text-sm text-gray-900">{selectedRequest.achAccountHolderName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.paymentType === "wire" && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bank Name</p>
                      <p className="text-sm text-gray-900">{selectedRequest.wireBankName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bank Address</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.wireBankAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">SWIFT/BIC</p>
                        <p className="text-sm text-gray-900">{selectedRequest.wireSwiftBic}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Routing Number</p>
                        <p className="text-sm text-gray-900">{selectedRequest.wireRoutingNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <p className="text-sm text-gray-900">{selectedRequest.wireAccountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Type</p>
                        <p className="text-sm text-gray-900 capitalize">{selectedRequest.wireAccountType}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Beneficiary Name</p>
                      <p className="text-sm text-gray-900">{selectedRequest.wireBeneficiaryName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Beneficiary Address</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.wireBeneficiaryAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Country</p>
                        <p className="text-sm text-gray-900">{selectedRequest.wireCountry}</p>
                      </div>
                      {selectedRequest.wireIban && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">IBAN</p>
                          <p className="text-sm text-gray-900">{selectedRequest.wireIban}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRequest.paymentType === "invoice" && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Invoice URL</p>
                      <a href={selectedRequest.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {selectedRequest.invoiceUrl}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Invoice Email</p>
                      <p className="text-sm text-gray-900">{selectedRequest.invoiceEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.status === "pending" && (
                <div className="border-t pt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve & Create Task
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Request</DialogTitle>
            <DialogDescription>
              Update the payment request details
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editAmount">Amount</Label>
                <Input
                  id="editAmount"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Paste a screenshot (Ctrl+V) or upload a receipt image
            </DialogDescription>
          </DialogHeader>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center"
            onPaste={handlePaste}
            tabIndex={0}
          >
            {receiptImage ? (
              <div className="space-y-4">
                <img
                  src={receiptImage}
                  alt="Receipt preview"
                  className="max-w-full max-h-64 mx-auto rounded"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReceiptImage(null)}
                >
                  Clear
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Press Ctrl+V to paste or click to upload
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setReceiptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              disabled={!receiptImage || approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve & Attach Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
