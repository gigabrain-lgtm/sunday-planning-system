import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Send, Building2 } from "lucide-react";
import { getAllAgencies } from "@/data/orgChart";

export default function ExternalSubmissions() {
  const [agencyId, setAgencyId] = useState<string>("");
  const [agencyName, setAgencyName] = useState("");
  const [contentLink, setContentLink] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [location] = useLocation();

  // Use static org chart data instead of database
  const agencies = useMemo(() => getAllAgencies(), []);
  const loadingAgencies = false;

  // Check for agency parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agencyParam = params.get('agency');
    
    if (agencyParam && agencies) {
      const agency = agencies.find(a => a.id === agencyParam || a.name.toLowerCase().replace(/\s+/g, '-') === agencyParam);
      if (agency) {
        setAgencyId(agency.id);
        setAgencyName(agency.name);
      }
    }
  }, [agencies]);

  const submitMutation = trpc.dashboard.submitContent.useMutation({
    onSuccess: () => {
      toast.success("Content submitted successfully!");
      setSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setAgencyId(null);
        setAgencyName("");
        setContentLink("");
        setDescription("");
        setDueDate("");
        setSubmitted(false);
      }, 3000);
    },
    onError: (error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      agencyName,
      agencyId: agencyId ? parseInt(agencyId) : undefined,
      contentLink,
      description,
      dueDate: dueDate || undefined,
    });
  };

  const handleAgencyChange = (selectedId: string) => {
    setAgencyId(selectedId);
    const agency = agencies?.find(a => a.id === selectedId);
    if (agency) {
      setAgencyName(agency.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">External Submissions</h1>
            <p className="text-muted-foreground mt-1">
              Submit content for review
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Content Review Submission
              </CardTitle>
              <CardDescription>
                Fill out the form below to submit content for Hunter's review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Submission Received!</h3>
                  <p className="text-gray-600 text-center">
                    Your content has been submitted for review. You'll receive feedback soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="agency">
                      Select Agency <span className="text-red-500">*</span>
                    </Label>
                    {loadingAgencies ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading agencies...</span>
                      </div>
                    ) : agencies && agencies.length > 0 ? (
                      <select
                        id="agency"
                        className="w-full p-3 border rounded-md"
                        value={agencyId || ""}
                        onChange={(e) => handleAgencyChange(e.target.value)}
                        required
                      >
                        <option value="">Select your agency...</option>
                        {agencies.map((agency) => (
                          <option key={agency.id} value={agency.id}>
                            {agency.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <Building2 className="w-4 h-4 inline mr-1" />
                          No agencies configured yet. Please contact the administrator.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentLink">
                      Link to Content <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contentLink"
                      type="url"
                      placeholder="https://..."
                      value={contentLink}
                      onChange={(e) => setContentLink(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Provide a link to the content (Google Drive, Dropbox, Loom, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the content and what kind of feedback you're looking for..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">
                      Due Date (Optional)
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      When do you need feedback by?
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitMutation.isLoading}
                  >
                    {submitMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Submission Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure the content link is accessible (check sharing permissions)</li>
              <li>• Provide clear context in the description</li>
              <li>• Specify what type of feedback you need (copy, design, strategy, etc.)</li>
              <li>• Allow 24-48 hours for review during business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
