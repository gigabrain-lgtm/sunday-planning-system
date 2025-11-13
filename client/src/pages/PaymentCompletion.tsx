import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function PaymentCompletion() {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [completionPaymentLink, setCompletionPaymentLink] = useState("");
  const [completionAmount, setCompletionAmount] = useState("");
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const { data: approvedRequests, isLoading, refetch } = trpc.paymentRequest.getApprovedForCompletion.useQuery();

  const completeMutation = trpc.paymentRequest.complete.useMutation({
    onSuccess: (data) => {
      toast.success(`Payment marked as completed! Task created in your finance list.`);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete payment");
    },
  });

  const resetForm = () => {
    setSelectedRequestId(null);
    setCompletionPaymentLink("");
    setCompletionAmount("");
    setVerificationErrors([]);
    setReceiptFile(null);
  };

  const handleSelectRequest = (request: any) => {
    setSelectedRequestId(request.id);
    setCompletionPaymentLink("");
    setCompletionAmount("");
    setVerificationErrors([]);
    setReceiptFile(null);
  };

  const verifyAndSubmit = () => {
    if (!selectedRequestId) return;

    const request = approvedRequests?.find((r: any) => r.id === selectedRequestId);
    if (!request) return;

    const errors: string[] = [];

    // Verify amount matches (allow 1% tolerance)
    const requestedAmount = parseFloat((request.amount || "0").replace(/[$,]/g, ""));
    const completedAmount = parseFloat(completionAmount.replace(/[$,]/g, ""));
    
    if (Math.abs(requestedAmount - completedAmount) > requestedAmount * 0.01) {
      errors.push(`Amount mismatch: Requested $${requestedAmount.toFixed(2)}, but you entered $${completedAmount.toFixed(2)}`);
    }

    // Verify last 4 digits of account number if ACH or Wire
    if (request.paymentType === "ach" && request.achAccountNumber) {
      const last4Original = request.achAccountNumber.slice(-4);
      const last4Input = completionPaymentLink.match(/\d{4}$/);
      
      if (!last4Input || last4Input[0] !== last4Original) {
        errors.push(`Account number verification failed: Last 4 digits should be ${last4Original}`);
      }
    }

    if (request.paymentType === "wire" && request.wireAccountNumber) {
      const last4Original = request.wireAccountNumber.slice(-4);
      const last4Input = completionPaymentLink.match(/\d{4}$/);
      
      if (!last4Input || last4Input[0] !== last4Original) {
        errors.push(`Account number verification failed: Last 4 digits should be ${last4Original}`);
      }
    }

    if (errors.length > 0) {
      setVerificationErrors(errors);
      return;
    }

    // All verifications passed, show confirmation
    setVerificationErrors([]);
    setShowConfirmDialog(true);
  };

  const handleConfirmComplete = async () => {
    if (!selectedRequestId) return;
    
    let receiptUrl = "";
    
    // Upload receipt to S3 if provided
    if (receiptFile) {
      setUploadingReceipt(true);
      try {
        const formData = new FormData();
        formData.append('file', receiptFile);
        
        const uploadResponse = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          receiptUrl = data.url;
        } else {
          toast.error('Failed to upload receipt');
          setUploadingReceipt(false);
          return;
        }
      } catch (error) {
        toast.error('Error uploading receipt');
        setUploadingReceipt(false);
        return;
      }
      setUploadingReceipt(false);
    }
    
    completeMutation.mutate({
      id: selectedRequestId,
      completionPaymentLink,
      completionAmount,
      receiptUrl,
    });
    setShowConfirmDialog(false);
  };

  const selectedRequest = approvedRequests?.find((r: any) => r.id === selectedRequestId);

  return (
    <Sidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Completion</h1>
          <p className="text-gray-600 mt-2">
            Mark payments as completed after processing ACH/Wire transfers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Approved Requests List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Approved Requests</CardTitle>
                <CardDescription>
                  Select a payment request to mark as completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : approvedRequests && approvedRequests.length > 0 ? (
                  <div className="space-y-3">
                    {approvedRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequestId === request.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleSelectRequest(request)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Request #{request.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {request.submitterName || "Guest"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {request.paymentType.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Amount:</strong> {request.amount}</p>
                          {request.paymentType === "ach" && request.achAccountNumber && (
                            <p><strong>Last 4:</strong> ****{request.achAccountNumber.slice(-4)}</p>
                          )}
                          {request.paymentType === "wire" && request.wireAccountNumber && (
                            <p><strong>Last 4:</strong> ****{request.wireAccountNumber.slice(-4)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No approved requests awaiting completion
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Completion Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>
                  Enter payment details after processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRequest ? (
                  <div className="space-y-6">
                    {/* Request Details */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h3 className="font-semibold text-gray-900">Request Details</h3>
                      <div className="text-sm space-y-1">
                        <p><strong>Submitter:</strong> {selectedRequest.submitterName}</p>
                        <p><strong>Email:</strong> {selectedRequest.submitterEmail}</p>
                        <p><strong>Requested Amount:</strong> {selectedRequest.amount}</p>
                        <p><strong>Type:</strong> {selectedRequest.paymentType.replace("_", " ").toUpperCase()}</p>
                        {selectedRequest.paymentType === "ach" && selectedRequest.achAccountNumber && (
                          <p><strong>Account (Last 4):</strong> ****{selectedRequest.achAccountNumber.slice(-4)}</p>
                        )}
                        {selectedRequest.paymentType === "wire" && selectedRequest.wireAccountNumber && (
                          <p><strong>Account (Last 4):</strong> ****{selectedRequest.wireAccountNumber.slice(-4)}</p>
                        )}
                      </div>
                    </div>

                    {/* Completion Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="completionPaymentLink">
                          Payment Link / Confirmation *
                        </Label>
                        <Input
                          id="completionPaymentLink"
                          value={completionPaymentLink}
                          onChange={(e) => setCompletionPaymentLink(e.target.value)}
                          placeholder="Enter payment confirmation link or reference"
                        />
                        <p className="text-xs text-gray-500">
                          For ACH/Wire: Include last 4 digits of account number for verification
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="completionAmount">
                          Actual Payment Amount *
                        </Label>
                        <Input
                          id="completionAmount"
                          value={completionAmount}
                          onChange={(e) => setCompletionAmount(e.target.value)}
                          placeholder="$0.00"
                        />
                        <p className="text-xs text-gray-500">
                          Must match requested amount (within 1%)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Receipt Upload (Optional)
                        </Label>
                        
                        {/* Paste Area */}
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                          onPaste={(e) => {
                            e.preventDefault();
                            const items = e.clipboardData?.items;
                            if (!items) return;
                            
                            for (let i = 0; i < items.length; i++) {
                              if (items[i].type.indexOf('image') !== -1) {
                                const blob = items[i].getAsFile();
                                if (blob) {
                                  const file = new File([blob], `receipt-${Date.now()}.png`, { type: blob.type });
                                  setReceiptFile(file);
                                  toast.success('Receipt pasted successfully!');
                                }
                                break;
                              }
                            }
                          }}
                          onClick={() => document.getElementById('receiptFileInput')?.click()}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              document.getElementById('receiptFileInput')?.click();
                            }
                          }}
                        >
                          {receiptFile ? (
                            <div className="space-y-2">
                              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                              <p className="text-sm font-medium text-green-600">
                                ✓ {receiptFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Click to change or paste a new image
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-gray-400">
                                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Paste receipt here (Ctrl+V / Cmd+V)
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Or click to browse files
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Hidden file input */}
                        <input
                          id="receiptFileInput"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setReceiptFile(file);
                              toast.success('Receipt uploaded successfully!');
                            }
                          }}
                          className="hidden"
                        />
                        
                        <p className="text-xs text-gray-500">
                          Take a screenshot and paste it here, or upload an image/PDF file
                        </p>
                      </div>

                      {/* Verification Errors */}
                      {verificationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-900 mb-1">Verification Failed</p>
                              <ul className="text-sm text-red-700 space-y-1">
                                {verificationErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        onClick={verifyAndSubmit}
                        disabled={!completionPaymentLink || !completionAmount || completeMutation.isPending}
                        className="w-full"
                      >
                        {completeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    Select a payment request from the list to complete
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this payment as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedRequest && (
            <div className="space-y-3 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">All Verifications Passed</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ Payment amount verified</li>
                      {(selectedRequest.paymentType === "ach" || selectedRequest.paymentType === "wire") && (
                        <li>✓ Account number last 4 digits verified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-gray-900">This will:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Create a task in your personal finance ClickUp list</li>
                  <li>• Update payment request status to "Completed"</li>
                  <li>• Record completion timestamp and details</li>
                  <li>• Set the Amount custom field in ClickUp</li>
                </ul>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <p><strong>Request ID:</strong> #{selectedRequest.id}</p>
                <p><strong>Submitter:</strong> {selectedRequest.submitterName}</p>
                <p><strong>Amount:</strong> {completionAmount}</p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Confirm & Complete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
