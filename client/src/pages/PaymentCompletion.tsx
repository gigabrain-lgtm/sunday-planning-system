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

export default function PaymentCompletion() {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [completionPaymentLink, setCompletionPaymentLink] = useState("");
  const [completionAmount, setCompletionAmount] = useState("");
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);

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
  };

  const handleSelectRequest = (request: any) => {
    setSelectedRequestId(request.id);
    setCompletionPaymentLink("");
    setCompletionAmount("");
    setVerificationErrors([]);
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

    // All verifications passed, submit
    completeMutation.mutate({
      id: selectedRequestId,
      completionPaymentLink,
      completionAmount,
    });
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
    </Sidebar>
  );
}
