import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type PaymentType = "credit_card" | "ach" | "wire" | "invoice";
type AccountType = "checking" | "savings";

export default function PaymentRequestsPublic() {
  const [paymentType, setPaymentType] = useState<PaymentType>("credit_card");
  
  // Submitter information
  const [submitterName, setSubmitterName] = useState("");
  const [amount, setAmount] = useState("");
  
  // Common fields
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [serviceStartDate, setServiceStartDate] = useState("");
  
  // Credit Card fields
  const [paymentLink, setPaymentLink] = useState("");
  const [creditCardConfirmed, setCreditCardConfirmed] = useState(false);
  
  // ACH fields
  const [achBankName, setAchBankName] = useState("");
  const [achBankAddress, setAchBankAddress] = useState("");
  const [achRoutingNumber, setAchRoutingNumber] = useState("");
  const [achAccountNumber, setAchAccountNumber] = useState("");
  const [achAccountType, setAchAccountType] = useState<AccountType>("checking");
  const [achAccountHolderName, setAchAccountHolderName] = useState("");
  
  // Wire fields
  const [wireBankName, setWireBankName] = useState("");
  const [wireBankAddress, setWireBankAddress] = useState("");
  const [wireSwiftBic, setWireSwiftBic] = useState("");
  const [wireRoutingNumber, setWireRoutingNumber] = useState("");
  const [wireAccountNumber, setWireAccountNumber] = useState("");
  const [wireAccountType, setWireAccountType] = useState<AccountType>("checking");
  const [wireBeneficiaryName, setWireBeneficiaryName] = useState("");
  const [wireBeneficiaryAddress, setWireBeneficiaryAddress] = useState("");
  const [wireCountry, setWireCountry] = useState("");
  const [wireIban, setWireIban] = useState("");
  
  // Invoice fields
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceConfirmed, setInvoiceConfirmed] = useState(false);

  const createMutation = trpc.paymentRequest.create.useMutation({
    onSuccess: () => {
      toast.success("Payment request submitted successfully! We'll review it shortly.");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit payment request");
    },
  });

  const resetForm = () => {
    setSubmitterName("");
    setAmount("");
    setDescription("");
    setDueDate("");
    setServiceStartDate("");
    setPaymentLink("");
    setCreditCardConfirmed(false);
    setAchBankName("");
    setAchBankAddress("");
    setAchRoutingNumber("");
    setAchAccountNumber("");
    setAchAccountType("checking");
    setAchAccountHolderName("");
    setWireBankName("");
    setWireBankAddress("");
    setWireSwiftBic("");
    setWireRoutingNumber("");
    setWireAccountNumber("");
    setWireAccountType("checking");
    setWireBeneficiaryName("");
    setWireBeneficiaryAddress("");
    setWireCountry("");
    setWireIban("");
    setInvoiceUrl("");
    setInvoiceEmail("");
    setInvoiceConfirmed(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      submitterName,
      amount,
      description: description || undefined,
      dueDate: dueDate || undefined,
      serviceStartDate: serviceStartDate || undefined,
    };

    if (paymentType === "credit_card") {
      if (!creditCardConfirmed) {
        toast.error("Please confirm the credit card payment requirements");
        return;
      }
      createMutation.mutate({
        paymentType: "credit_card",
        submitterName,
        amount,
        paymentLink,
        description,
        dueDate,
        serviceStartDate,
      });
    } else if (paymentType === "ach") {
      createMutation.mutate({
        paymentType: "ach",
        achBankName,
        achBankAddress,
        achRoutingNumber,
        achAccountNumber,
        achAccountType,
        achAccountHolderName,
        ...baseData,
      });
    } else if (paymentType === "wire") {
      createMutation.mutate({
        paymentType: "wire",
        wireBankName,
        wireBankAddress,
        wireSwiftBic,
        wireRoutingNumber,
        wireAccountNumber,
        wireAccountType,
        wireBeneficiaryName,
        wireBeneficiaryAddress,
        wireCountry,
        wireIban: wireIban || undefined,
        ...baseData,
      });
    } else if (paymentType === "invoice") {
      if (!invoiceConfirmed) {
        toast.error("Please confirm the invoice/portal payment requirements");
        return;
      }
      createMutation.mutate({
        paymentType: "invoice",
        invoiceUrl,
        invoiceEmail,
        ...baseData,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white py-6 shadow-lg">
        <div className="container mx-auto px-8">
          <h1 className="text-2xl font-bold">GIGABRANDS Payment Request</h1>
          <p className="text-gray-300 mt-1">Submit your payment information securely</p>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto p-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border">
          <div className="space-y-4">
            {/* Submitter Information */}
            <div className="space-y-2">
              <Label htmlFor="submitterName">Your Full Name *</Label>
              <Input
                id="submitterName"
                placeholder="Enter your full name"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Invoice Amount *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="$0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={(value) => setPaymentType(value as PaymentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                  <SelectItem value="invoice">Invoice/Portal Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Credit Card Notice */}
            {paymentType === "credit_card" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> We ONLY accept one-page checkouts (like Stripe, etc.) and we do not pay processing fees. If you want us to pay processing fees, we will not complete the payment. Please select ACH instead.
                </p>
              </div>
            )}

            {/* Credit Card Fields */}
            {paymentType === "credit_card" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentLink">Payment Link *</Label>
                  <Input
                    id="paymentLink"
                    type="url"
                    placeholder="https://checkout.stripe.com/..."
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the payment purpose..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceStartDate">Start of Services Date *</Label>
                    <Input
                      id="serviceStartDate"
                      type="date"
                      value={serviceStartDate}
                      onChange={(e) => setServiceStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="creditCardConfirm"
                    checked={creditCardConfirmed}
                    onCheckedChange={(checked) => setCreditCardConfirmed(checked === true)}
                    required
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="creditCardConfirm"
                      className="text-sm font-normal cursor-pointer"
                    >
                      I confirm this page is a single page checkout that does not require an account. I also confirm that there are no processing fees. *
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* ACH Fields */}
            {paymentType === "ach" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="achBankName">Bank Name *</Label>
                  <Input
                    id="achBankName"
                    placeholder="Enter the name of your bank"
                    value={achBankName}
                    onChange={(e) => setAchBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achBankAddress">Bank Address *</Label>
                  <Textarea
                    id="achBankAddress"
                    placeholder="Enter the full address of the bank"
                    value={achBankAddress}
                    onChange={(e) => setAchBankAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="achRoutingNumber">Bank Routing Number *</Label>
                    <Input
                      id="achRoutingNumber"
                      placeholder="Enter your bank's ACH routing number"
                      value={achRoutingNumber}
                      onChange={(e) => setAchRoutingNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="achAccountNumber">Bank Account Number *</Label>
                    <Input
                      id="achAccountNumber"
                      placeholder="Enter your bank account number"
                      value={achAccountNumber}
                      onChange={(e) => setAchAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achAccountType">Account Type *</Label>
                  <Select value={achAccountType} onValueChange={(value) => setAchAccountType(value as AccountType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achAccountHolderName">Account Holder Name *</Label>
                  <Input
                    id="achAccountHolderName"
                    placeholder="Enter the name of the account holder as it appears on the bank account"
                    value={achAccountHolderName}
                    onChange={(e) => setAchAccountHolderName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achDescription">Description (Optional)</Label>
                  <Textarea
                    id="achDescription"
                    placeholder="Additional notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Wire Fields */}
            {paymentType === "wire" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wireBankName">Bank Name *</Label>
                  <Input
                    id="wireBankName"
                    placeholder="Enter the name of your bank"
                    value={wireBankName}
                    onChange={(e) => setWireBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireBankAddress">Bank Address *</Label>
                  <Textarea
                    id="wireBankAddress"
                    placeholder="Enter the full address of the bank"
                    value={wireBankAddress}
                    onChange={(e) => setWireBankAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wireSwiftBic">SWIFT/BIC Code *</Label>
                    <Input
                      id="wireSwiftBic"
                      placeholder="Enter the SWIFT/BIC code for international transfers"
                      value={wireSwiftBic}
                      onChange={(e) => setWireSwiftBic(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wireRoutingNumber">Bank Routing Number *</Label>
                    <Input
                      id="wireRoutingNumber"
                      placeholder="Enter your bank's wire transfer routing number"
                      value={wireRoutingNumber}
                      onChange={(e) => setWireRoutingNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireAccountNumber">Account Number *</Label>
                  <Input
                    id="wireAccountNumber"
                    placeholder="Enter your bank account number for wire transfers"
                    value={wireAccountNumber}
                    onChange={(e) => setWireAccountNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireAccountType">Account Type *</Label>
                  <Select value={wireAccountType} onValueChange={(value) => setWireAccountType(value as AccountType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireBeneficiaryName">Beneficiary Name *</Label>
                  <Input
                    id="wireBeneficiaryName"
                    placeholder="Enter the name of the beneficiary (account holder)"
                    value={wireBeneficiaryName}
                    onChange={(e) => setWireBeneficiaryName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireBeneficiaryAddress">Beneficiary Address *</Label>
                  <Textarea
                    id="wireBeneficiaryAddress"
                    placeholder="Enter the address of the account holder"
                    value={wireBeneficiaryAddress}
                    onChange={(e) => setWireBeneficiaryAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireCountry">Country of Bank *</Label>
                  <Input
                    id="wireCountry"
                    placeholder="Select the country of the bank"
                    value={wireCountry}
                    onChange={(e) => setWireCountry(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireIban">IBAN (Optional)</Label>
                  <Input
                    id="wireIban"
                    placeholder="Enter IBAN if applicable"
                    value={wireIban}
                    onChange={(e) => setWireIban(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wireDescription">Description (Optional)</Label>
                  <Textarea
                    id="wireDescription"
                    placeholder="Additional notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Invoice Fields */}
            {paymentType === "invoice" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="invoiceUrl">Invoice Link/Portal URL *</Label>
                  <Input
                    id="invoiceUrl"
                    type="url"
                    placeholder="Enter the URL or link to your payment portal or invoice system"
                    value={invoiceUrl}
                    onChange={(e) => setInvoiceUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceEmail">Invoice Submission Email Address *</Label>
                  <Input
                    id="invoiceEmail"
                    type="email"
                    placeholder="Enter the email address where invoices should be sent"
                    value={invoiceEmail}
                    onChange={(e) => setInvoiceEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDescription">Description (Optional)</Label>
                  <Textarea
                    id="invoiceDescription"
                    placeholder="Additional notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="invoiceConfirm"
                    checked={invoiceConfirmed}
                    onCheckedChange={(checked) => setInvoiceConfirmed(checked === true)}
                    required
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="invoiceConfirm"
                      className="text-sm font-normal cursor-pointer"
                    >
                      I confirm this page is a single page checkout that does not require an account. I also confirm that there are no processing fees. *
                    </Label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset Form
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-8 text-center">
          <p className="text-sm">© 2024 GIGABRANDS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
