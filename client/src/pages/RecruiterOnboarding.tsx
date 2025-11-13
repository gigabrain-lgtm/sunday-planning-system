import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const AVAILABLE_JOBS = [
  "Closer",
  "Client facing BM/AM/CSM",
  "Personal Assistant",
  "Brand Director",
  "Appointment Setter",
  "Executive Assistant",
  "Senior Amazon PPC Strategist",
  "Graphic Designer",
  "Operations Assistant",
  "Software Engineer",
  "Senior Amazon Account Manager",
  "Amazon Account Manager",
  "Amazon PPC Manager",
  "GTM Engineer",
  "Generative AI Developer",
  "Bookkeeper",
  "Senior Recruiter",
  "Client Success Manager",
];

type Step = 1 | 2 | 3 | 4 | 5;

export default function RecruiterOnboarding() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [recruiterMode, setRecruiterMode] = useState<"new" | "existing">("new");
  const [recruiterId, setRecruiterId] = useState<number | null>(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [completedJobs, setCompletedJobs] = useState<string[]>([]);
  
  // Auto-select recruiter from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recruiterIdParam = params.get('recruiterId');
    if (recruiterIdParam) {
      const id = parseInt(recruiterIdParam, 10);
      if (!isNaN(id)) {
        setRecruiterMode('existing');
        setRecruiterId(id);
      }
    }
  }, []);
  
  // Step 1: Basic Info
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterCode, setRecruiterCode] = useState("");
  const [slackChannelId, setSlackChannelId] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  
  // Step 2: Job Title Generation
  const [agencyName, setAgencyName] = useState("");
  const [nomenclature, setNomenclature] = useState("");
  const [currentJobAssignmentId, setCurrentJobAssignmentId] = useState<number | null>(null);
  
  // Step 3: Culture Index
  const [cultureIndexInternalLink, setCultureIndexInternalLink] = useState("");
  const [cultureIndexAssessmentLink, setCultureIndexAssessmentLink] = useState("");
  
  // Step 4: Workable
  const [workableLink, setWorkableLink] = useState("");
  const [cultureIndexQuestionAdded, setCultureIndexQuestionAdded] = useState(false);
  
  const { data: recruiters } = trpc.recruiters.list.useQuery();
  const createRecruiterMutation = trpc.recruiters.create.useMutation();
  const createJobAssignmentMutation = trpc.jobAssignments.create.useMutation();
  const updateJobAssignmentMutation = trpc.jobAssignments.update.useMutation();
  const utils = trpc.useUtils();
  
  const getCurrentJob = () => selectedJobs[currentJobIndex];
  
  const handleStep1Next = async () => {
    if (recruiterMode === "new") {
      if (!recruiterName || !slackChannelId || selectedJobs.length === 0) {
        toast.error("Please fill in all fields and select at least one job");
        return;
      }
      
      try {
        const result = await createRecruiterMutation.mutateAsync({
          name: recruiterName,
          slackChannelId,
        });
        
        setRecruiterId(result.id);
        setRecruiterCode(result.recruiterCode);
        setAgencyName(recruiterName);
        setCurrentStep(2);
        toast.success("Recruiter created! Now let's set up the jobs.");
      } catch (error) {
        toast.error("Failed to create recruiter");
      }
    } else {
      if (!recruiterId || selectedJobs.length === 0) {
        toast.error("Please select a recruiter and at least one job");
        return;
      }
      
      const selectedRecruiter = recruiters?.find(r => r.id === recruiterId);
      if (selectedRecruiter) {
        setAgencyName(selectedRecruiter.name);
        setRecruiterCode(selectedRecruiter.recruiterCode);
      }
      setCurrentStep(2);
      toast.success("Let's set up the jobs for this recruiter.");
    }
  };
  
  const handleStep2Next = async () => {
    if (!agencyName) {
      toast.error("Please enter agency name");
      return;
    }
    
    try {
      const result = await createJobAssignmentMutation.mutateAsync({
        recruiterId: recruiterId!,
        jobTitle: getCurrentJob(),
        agencyName,
      });
      
      setCurrentJobAssignmentId(result.id);
      setNomenclature(result.nomenclature);
      setCurrentStep(3);
      toast.success(`Job nomenclature generated: ${result.nomenclature}`);
    } catch (error) {
      toast.error("Failed to create job assignment");
    }
  };
  
  const handleStep3Next = async () => {
    console.log('=== Step 3 Next ===');
    console.log('currentJobAssignmentId:', currentJobAssignmentId);
    console.log('cultureIndexInternalLink:', cultureIndexInternalLink);
    console.log('cultureIndexAssessmentLink:', cultureIndexAssessmentLink);
    
    if (!currentJobAssignmentId) {
      console.error('Missing currentJobAssignmentId!');
      toast.error("Job assignment ID is missing. Please go back and try again.");
      return;
    }
    
    try {
      console.log('Calling updateJobAssignmentMutation...');
      const result = await updateJobAssignmentMutation.mutateAsync({
        id: currentJobAssignmentId,
        cultureIndexInternalLink: cultureIndexInternalLink || undefined,
        cultureIndexAssessmentLink: cultureIndexAssessmentLink || undefined,
        status: 'culture_index_pending',
      });
      console.log('Mutation success:', result);
      
      setCurrentStep(4);
      toast.success("Culture Index configured!");
    } catch (error: any) {
      console.error('Mutation error:', error);
      toast.error(`Failed to update Culture Index links: ${error.message || 'Unknown error'}`);
    }
  };
  
  const handleStep4Next = async () => {
    if (!workableLink || !cultureIndexQuestionAdded) {
      toast.error("Please add Workable link and confirm Culture Index question was added");
      return;
    }
    
    try {
      await updateJobAssignmentMutation.mutateAsync({
        id: currentJobAssignmentId!,
        workableLink,
        cultureIndexQuestionAdded: cultureIndexQuestionAdded ? 1 : 0,
        status: 'completed',
      });
      
      utils.jobAssignments.list.invalidate();
      utils.recruiters.list.invalidate();
      
      // Mark current job as completed
      setCompletedJobs([...completedJobs, getCurrentJob()]);
      
      // Check if there are more jobs to process
      if (currentJobIndex < selectedJobs.length - 1) {
        // Move to next job
        setCurrentJobIndex(currentJobIndex + 1);
        setCurrentStep(2);
        // Keep agencyName populated for next job
        setCultureIndexInternalLink("");
        setCultureIndexAssessmentLink("");
        setWorkableLink("");
        setCultureIndexQuestionAdded(false);
        setCurrentJobAssignmentId(null);
        toast.success(`Job completed! Moving to next job (${currentJobIndex + 2}/${selectedJobs.length})`);
      } else {
        // All jobs completed
        setCurrentStep(5);
        toast.success("All jobs completed!");
      }
    } catch (error) {
      toast.error("Failed to complete job setup");
    }
  };
  
  const handleFinish = () => {
    toast.success(`Recruiter onboarding complete! ${selectedJobs.length} job(s) set up successfully.`);
    
    // Reset form
    setCurrentStep(1);
    setRecruiterMode("new");
    setRecruiterId(null);
    setCurrentJobIndex(0);
    setCompletedJobs([]);
    setRecruiterName("");
    setSlackChannelId("");
    setSelectedJobs([]);
    setAgencyName("");
    setNomenclature("");
    setCultureIndexInternalLink("");
    setCultureIndexAssessmentLink("");
    setWorkableLink("");
    setCultureIndexQuestionAdded(false);
    setCurrentJobAssignmentId(null);
  };
  
  const toggleJobSelection = (job: string) => {
    setSelectedJobs(prev =>
      prev.includes(job) ? prev.filter(j => j !== job) : [...prev, job]
    );
  };
  
  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Basic Info" },
      { num: 2, label: "Job Title" },
      { num: 3, label: "Culture Index" },
      { num: 4, label: "Workable" },
      { num: 5, label: "Complete" },
    ];
    
    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.num
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              }`}>
                {currentStep > step.num ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span>{step.num}</span>
                )}
              </div>
              <span className="text-sm mt-2">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.num ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Recruiter Onboarding</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new or existing recruiter with Culture Index and Workable integration
          </p>
        </div>
        
        {renderStepIndicator()}
        
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Basic Information</CardTitle>
              <CardDescription>Choose to create a new recruiter or select an existing one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Recruiter Type</Label>
                <RadioGroup value={recruiterMode} onValueChange={(value) => setRecruiterMode(value as "new" | "existing")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="font-normal cursor-pointer">Create New Recruiter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="font-normal cursor-pointer">Use Existing Recruiter</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {recruiterMode === "new" ? (
                <>
                  <div>
                    <Label htmlFor="recruiterName">Recruiter Name</Label>
                    <Input
                      id="recruiterName"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="e.g., Katia, Stealth, Kurtis"
                    />
                    <p className="text-xs text-muted-foreground mt-1">A unique code will be auto-generated</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="slackChannelId">Slack Channel ID</Label>
                    <Input
                      id="slackChannelId"
                      value={slackChannelId}
                      onChange={(e) => setSlackChannelId(e.target.value)}
                      placeholder="e.g., C09R24WG3FV"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="existingRecruiter">Select Recruiter</Label>
                  <Select value={recruiterId?.toString()} onValueChange={(value) => setRecruiterId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a recruiter" />
                    </SelectTrigger>
                    <SelectContent>
                      {recruiters?.map((recruiter) => (
                        <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
                          {recruiter.name} ({recruiter.slackChannelId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label>Select Jobs (choose at least one)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-64 overflow-y-auto p-2 border rounded">
                  {AVAILABLE_JOBS.map((job) => (
                    <div key={job} className="flex items-center space-x-2">
                      <Checkbox
                        id={job}
                        checked={selectedJobs.includes(job)}
                        onCheckedChange={() => toggleJobSelection(job)}
                      />
                      <Label htmlFor={job} className="font-normal cursor-pointer text-sm">
                        {job}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedJobs.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedJobs.length} job(s) selected
                  </p>
                )}
              </div>
              
              <Button onClick={handleStep1Next} className="w-full">
                Next: Set Up Jobs
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Job Title Generation */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Job Title & Agency</CardTitle>
              <CardDescription>
                Setting up job {currentJobIndex + 1} of {selectedJobs.length}: {getCurrentJob()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded">
                <p className="text-sm font-medium">Current Job:</p>
                <p className="text-lg font-bold">{getCurrentJob()}</p>
              </div>
              
              <div>
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input
                  id="agencyName"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g., GigaBrands"
                />
              </div>
              
              <div className="p-4 bg-muted/50 rounded">
                <p className="text-sm text-muted-foreground">
                  <strong>Nomenclature Preview:</strong> {getCurrentJob()} - {recruiterCode || "[Recruiter Code]"}
                </p>
              </div>
              
              {completedJobs.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-sm font-medium text-green-700">Completed Jobs:</p>
                  <ul className="list-disc list-inside text-sm text-green-600 mt-1">
                    {completedJobs.map(job => <li key={job}>{job}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button type="button" onClick={handleStep2Next} className="flex-1">
                  Generate Nomenclature & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Culture Index */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Culture Index Setup</CardTitle>
              <CardDescription>
                Job: {nomenclature}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2 mb-2">
                <p className="text-sm font-medium text-muted-foreground">📋 Instructions:</p>
                <p className="text-sm text-muted-foreground">
                  Create the Culture Index test, then share the links below:
                </p>
                <div className="space-y-1 text-xs text-muted-foreground pl-4">
                  <p><strong>Internal Review Link</strong> example:</p>
                  <p className="font-mono text-xs">
                    https://portal.cultureindex.com/clients/36wzkM9xFf/home/details/309590
                  </p>
                  <p className="pt-2"><strong>Assessment Link</strong> example:</p>
                  <p className="font-mono text-xs">
                    https://go.cultureindex.com/p/0rpkEuYdKzh
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="cultureIndexInternal">Culture Index Internal Link</Label>
                <Input
                  id="cultureIndexInternal"
                  value={cultureIndexInternalLink}
                  onChange={(e) => setCultureIndexInternalLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="cultureIndexAssessment">Culture Index Assessment Link</Label>
                <Input
                  id="cultureIndexAssessment"
                  value={cultureIndexAssessmentLink}
                  onChange={(e) => setCultureIndexAssessmentLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button 
                  type="button"
                  onClick={handleStep3Next} 
                  className="flex-1"
                >
                  Next: Workable Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: Workable */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Workable Setup</CardTitle>
              <CardDescription>
                Job: {nomenclature}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workableLink">Workable Job Link</Label>
                <Input
                  id="workableLink"
                  value={workableLink}
                  onChange={(e) => setWorkableLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cultureIndexQuestion"
                  checked={cultureIndexQuestionAdded}
                  onCheckedChange={(checked) => setCultureIndexQuestionAdded(checked as boolean)}
                />
                <Label htmlFor="cultureIndexQuestion" className="font-normal cursor-pointer">
                  I have added the Culture Index question to Workable
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setCurrentStep(3)}
                >
                  Back
                </Button>
                <Button onClick={handleStep4Next} className="flex-1">
                  {currentJobIndex < selectedJobs.length - 1 ? 'Complete & Next Job' : 'Complete Job Setup'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 5: Complete */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Onboarding Complete!</CardTitle>
              <CardDescription>
                All jobs have been successfully set up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-700">
                  {selectedJobs.length} job(s) completed for {recruiterMode === "new" ? recruiterName : recruiters?.find(r => r.id === recruiterId)?.name}
                </p>
                <ul className="list-disc list-inside text-sm text-green-600 mt-4">
                  {selectedJobs.map(job => <li key={job}>{job}</li>)}
                </ul>
              </div>
              
              <Button onClick={handleFinish} className="w-full">
                Finish & Start New Onboarding
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
