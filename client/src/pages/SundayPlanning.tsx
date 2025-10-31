import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BusinessPlanning } from "@/components/planning/BusinessPlanning";
import { ManifestationTracker } from "@/components/planning/ManifestationTracker";
import { PersonalPlanning } from "@/components/planning/PersonalPlanning";
import { BusinessNeedleMovers } from "@/components/planning/BusinessNeedleMovers";
import Roadmap from "@/components/planning/Roadmap";
import OKRReview from "@/components/planning/OKRReview";
import { OKRDashboard } from "@/components/planning/OKRDashboard";
import { Visualization } from "@/components/Visualization";
import { Scorecard } from "@/components/planning/Scorecard";
import { SleepReview } from "@/components/planning/SleepReview";
import { LifePlanning } from "@/components/planning/LifePlanning";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Step = "business" | "manifestation" | "personal" | "okr" | "okrDashboard" | "needleMovers" | "roadmap" | "scorecard" | "visualization" | "sleep" | "lifePlanning";

export default function SundayPlanning() {
  const [currentStep, setCurrentStep] = useState<Step>("business");
  const [weekOf, setWeekOf] = useState(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    return sunday.toISOString().split("T")[0];
  });

  const queryClient = trpc.useContext();

  // Prefetch all ClickUp data when component mounts for instant navigation
  useEffect(() => {
    // Prefetch OKR data
    queryClient.okr.fetchObjectives.prefetch();
    queryClient.okr.fetchKeyResults.prefetch();
    
    // Prefetch Needle Movers
    queryClient.needleMovers.fetchBusiness.prefetch();
    queryClient.needleMovers.fetchPersonal.prefetch();
    queryClient.needleMovers.getTeamMembers.prefetch({ listType: 'business' });
    
    // Prefetch Roadmap
    queryClient.needleMovers.fetchRoadmap.prefetch();
  }, [queryClient]);

  // Business Planning State
  const [businessPlanning, setBusinessPlanning] = useState<Record<string, string>>({});

  // Manifestation State
  const [manifestationRatings, setManifestationRatings] = useState<Record<string, number>>({
    spiritual: 5,
    social: 5,
    relationship: 5,
    status: 5,
    team: 5,
    business: 5,
    travel: 5,
    environment: 5,
    family: 5,
    skills: 5,
    health: 5,
    affirmations: 5,
  });

  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [actionables, setActionables] = useState<Record<string, string>>({});

  // Personal Planning State
  const [personalPlanning, setPersonalPlanning] = useState({
    eaTasks: "",
    paTasks: "",
    personalTasks: "",
  });

  // Needle Movers State
  const [completedNeedleMovers, setCompletedNeedleMovers] = useState<string[]>([]);
  const [newNeedleMovers, setNewNeedleMovers] = useState<any[]>([]);
  const [movedToRoadmap, setMovedToRoadmap] = useState<any[]>([]);

  const saveMutation = trpc.planning.save.useMutation({
    onSuccess: () => {
      toast.success("Sunday planning saved successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const batchCompleteMutation = trpc.needleMovers.batchMarkComplete.useMutation({
    onSuccess: (data) => {
      if (data.count > 0) {
        toast.success(`${data.count} task${data.count > 1 ? 's' : ''} marked complete in ClickUp!`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to mark tasks complete: ${error.message}`);
    },
  });

  const createNeedleMoverMutation = trpc.needleMovers.createBusiness.useMutation({
    onError: (error) => {
      toast.error(`Failed to create needle mover: ${error.message}`);
    },
  });

  const handleBusinessChange = (key: string, value: string) => {
    setBusinessPlanning((prev) => ({ ...prev, [key]: value }));
  };

  const handlePersonalChange = (key: string, value: string) => {
    setPersonalPlanning((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Save planning data
      await saveMutation.mutateAsync({
        weekOf,
        businessPlanning,
        personalPlanning,
        manifestations: {
          ratings: manifestationRatings,
          reflections,
          actionables,
        },
      });

      // Batch create new needle movers in ClickUp
      if (newNeedleMovers.length > 0) {
        const validNeedleMovers = newNeedleMovers.filter(nm => nm.name && nm.name.trim());
        await Promise.all(
          validNeedleMovers.map(nm => createNeedleMoverMutation.mutateAsync(nm))
        );
        if (validNeedleMovers.length > 0) {
          toast.success(`${validNeedleMovers.length} new needle mover${validNeedleMovers.length > 1 ? 's' : ''} created in ClickUp!`);
        }
      }

      // Batch update completed needle movers in ClickUp
      if (completedNeedleMovers.length > 0) {
        await batchCompleteMutation.mutateAsync({
          taskIds: completedNeedleMovers,
        });
      }

      // Reset state after successful save
      setBusinessPlanning({});
      setManifestationRatings({
        spiritual: 5,
        social: 5,
        relationship: 5,
        status: 5,
        team: 5,
        business: 5,
        travel: 5,
        environment: 5,
        family: 5,
        skills: 5,
        health: 5,
        affirmations: 5,
      });
      setReflections({});
      setActionables({});
      setPersonalPlanning({
        eaTasks: "",
        paTasks: "",
        personalTasks: "",
      });
      setCompletedNeedleMovers([]);
      setNewNeedleMovers([]);
      setCurrentStep("business");
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const steps: { key: Step; label: string; progress: number }[] = [
    { key: "business", label: "Business Planning", progress: 10 },
    { key: "manifestation", label: "Manifestation Tracker", progress: 20 },
    { key: "personal", label: "Personal Planning", progress: 30 },
    { key: "okr", label: "OKR Review", progress: 40 },
    { key: "okrDashboard", label: "OKR Dashboard", progress: 50 },
    { key: "needleMovers", label: "Needle Movers", progress: 60 },
    { key: "roadmap", label: "Roadmap", progress: 70 },
    { key: "scorecard", label: "Scorecard", progress: 77 },
    { key: "visualization", label: "Visualization", progress: 84 },
    { key: "lifePlanning", label: "Life Planning", progress: 91 },
    { key: "sleep", label: "Sleep Review", progress: 100 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);
  const currentProgress = steps[currentStepIndex].progress;

  const goToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const goToPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container max-w-5xl py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Sunday Planning System
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Week of {new Date(weekOf).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 space-y-4">
          <Progress value={currentProgress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(step.key)}
                className={`text-sm font-medium transition-colors ${
                  currentStepIndex === index
                    ? "text-primary"
                    : currentStepIndex > index
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {currentStepIndex > index && <Check className="inline w-4 h-4 mr-1" />}
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === "business" && (
            <BusinessPlanning values={businessPlanning} onChange={handleBusinessChange} />
          )}
          {currentStep === "manifestation" && (
            <ManifestationTracker
              ratings={manifestationRatings}
              reflections={reflections}
              actionables={actionables}
              onRatingChange={(pillar: string, rating: number) =>
                setManifestationRatings((prev) => ({ ...prev, [pillar]: rating }))
              }
              onReflectionChange={(pillar: string, reflection: string) =>
                setReflections((prev) => ({ ...prev, [pillar]: reflection }))
              }
              onActionablesChange={(pillar: string, actionablesText: string) =>
                setActionables((prev) => ({ ...prev, [pillar]: actionablesText }))
              }
            />
          )}
          {currentStep === "personal" && (
            <PersonalPlanning values={personalPlanning} onChange={handlePersonalChange} />
          )}
          {currentStep === "okr" && (
            <OKRReview />
          )}
          {currentStep === "okrDashboard" && (
            <OKRDashboard />
          )}
          {currentStep === "needleMovers" && (
            <BusinessNeedleMovers 
              businessPlanningNotes={businessPlanning}
              onCompletedTasksChange={setCompletedNeedleMovers}
              onNewNeedleMoversChange={setNewNeedleMovers}
              onMovedToRoadmapChange={setMovedToRoadmap}
            />
          )}
          {currentStep === "roadmap" && (
            <Roadmap movedTasks={movedToRoadmap} />
          )}
          {currentStep === "scorecard" && (
            <Scorecard />
          )}
          {currentStep === "visualization" && (
            <Visualization />
          )}
          {currentStep === "sleep" && (
            <SleepReview />
          )}
          {currentStep === "lifePlanning" && (
            <LifePlanning />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center sticky bottom-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl shadow-lg border">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={goToNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Planning
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

