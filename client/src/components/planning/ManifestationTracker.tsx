import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MANIFESTATION_STATES, PILLAR_NAMES } from "@/data/manifestationStates";
import { useState } from "react";

interface ManifestationTrackerProps {
  ratings: Record<string, number>;
  currentStates: Record<string, string>;
  onRatingChange: (pillar: string, rating: number) => void;
  onCurrentStateChange: (pillar: string, state: string) => void;
}

export function ManifestationTracker({
  ratings,
  currentStates,
  onRatingChange,
  onCurrentStateChange,
}: ManifestationTrackerProps) {
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({});

  const togglePillar = (pillar: string) => {
    setExpandedPillars((prev) => ({
      ...prev,
      [pillar]: !prev[pillar],
    }));
  };

  const pillars = PILLAR_NAMES.filter(p => p !== "Affirmations"); // Affirmations handled separately

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manifestation Tracker</h2>
        <p className="text-muted-foreground mt-2">
          Rate your progress and visualize your ideal state across all life pillars.
        </p>
      </div>

      <div className="grid gap-6">
        {pillars.map((pillar) => {
          const pillarKey = pillar.toLowerCase();
          const states = MANIFESTATION_STATES[pillarKey as keyof typeof MANIFESTATION_STATES] || [];
          const isExpanded = expandedPillars[pillarKey];

          return (
            <Card key={pillar} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="text-2xl">{pillar}</CardTitle>
                <CardDescription>
                  How did you do this week?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Weekly Update: How did you do this week?</Label>
                    <span className="text-2xl font-bold text-primary">
                      {ratings[pillarKey] ?? 5}
                    </span>
                  </div>
                  <Slider
                    value={[ratings[pillarKey] ?? 5]}
                    onValueChange={(value) => onRatingChange(pillarKey, value[0])}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Manifestation States */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>States</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePillar(pillarKey)}
                    >
                      {isExpanded ? "Collapse" : "Edit"}
                    </Button>
                  </div>
                  <div className="space-y-2 bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    {states.map((state, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {state}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Current State */}
                <div className="space-y-3">
                  <Label htmlFor={`current-${pillarKey}`}>
                    Your Current State for {pillar}
                  </Label>
                  <Textarea
                    id={`current-${pillarKey}`}
                    placeholder={`Write your current state for this pillar...`}
                    value={currentStates[pillarKey] || ""}
                    onChange={(e) => onCurrentStateChange(pillarKey, e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {currentStates[pillarKey]?.length || 0} characters
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

