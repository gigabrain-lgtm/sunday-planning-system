import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MANIFESTATION_STATES, PILLAR_NAMES } from "@/data/manifestationStates";
import { useState } from "react";
import { X } from "lucide-react";

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
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [editedStates, setEditedStates] = useState<Record<string, string[]>>({});
  const [newState, setNewState] = useState("");

  const pillars = PILLAR_NAMES.filter(p => p !== "Affirmations");

  const startEditing = (pillar: string) => {
    const pillarKey = pillar.toLowerCase();
    const states = MANIFESTATION_STATES[pillarKey as keyof typeof MANIFESTATION_STATES] || [];
    setEditedStates({ ...editedStates, [pillarKey]: [...states] });
    setEditingPillar(pillarKey);
    setNewState("");
  };

  const cancelEditing = () => {
    setEditingPillar(null);
    setNewState("");
  };

  const saveChanges = (pillarKey: string) => {
    // In a real app, this would save to backend/Airtable
    // For now, we just close the edit mode
    // TODO: Implement actual save to Airtable
    setEditingPillar(null);
    setNewState("");
  };

  const removeState = (pillarKey: string, index: number) => {
    const updated = [...(editedStates[pillarKey] || [])];
    updated.splice(index, 1);
    setEditedStates({ ...editedStates, [pillarKey]: updated });
  };

  const updateState = (pillarKey: string, index: number, value: string) => {
    const updated = [...(editedStates[pillarKey] || [])];
    updated[index] = value;
    setEditedStates({ ...editedStates, [pillarKey]: updated });
  };

  const addState = (pillarKey: string) => {
    if (newState.trim()) {
      const updated = [...(editedStates[pillarKey] || []), newState.trim()];
      setEditedStates({ ...editedStates, [pillarKey]: updated });
      setNewState("");
    }
  };

  const getStateBorderColor = (index: number) => {
    const colors = [
      "border-green-400",
      "border-orange-400",
      "border-purple-400",
      "border-blue-400",
      "border-pink-400",
      "border-teal-400",
      "border-yellow-400",
      "border-indigo-400",
    ];
    return colors[index % colors.length];
  };

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
          const states = editingPillar === pillarKey 
            ? (editedStates[pillarKey] || MANIFESTATION_STATES[pillarKey as keyof typeof MANIFESTATION_STATES] || [])
            : (MANIFESTATION_STATES[pillarKey as keyof typeof MANIFESTATION_STATES] || []);
          const isEditing = editingPillar === pillarKey;

          return (
            <Card key={pillar} className="bg-white dark:bg-gray-900 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl text-center">{pillar}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Rating Boxes */}
                <div className="space-y-3">
                  <Label className="text-base">Weekly Update: How did you do this week?</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => onRatingChange(pillarKey, num)}
                        className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold transition-colors ${
                          (ratings[pillarKey] ?? 5) === num
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-purple-400"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manifestation States */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">States</Label>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(pillar)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addState(pillarKey)}
                          className="text-white bg-green-600 border-green-600 hover:bg-green-700"
                        >
                          + Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          className="text-white bg-blue-600 border-blue-600 hover:bg-blue-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {!isEditing ? (
                      // View mode - read-only states
                      states.map((state, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm text-gray-700 dark:text-gray-300">
                          {state}
                        </div>
                      ))
                    ) : (
                      // Edit mode - editable inputs with X buttons
                      <>
                        {states.map((state, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <Input
                              value={state}
                              onChange={(e) => updateState(pillarKey, index, e.target.value)}
                              className="flex-1 border-2"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeState(pillarKey, index)}
                              className="h-10 w-10 p-0"
                            >
                              X
                            </Button>
                          </div>
                        ))}
                        
                        {isEditing && (
                          <Button
                            onClick={() => saveChanges(pillarKey)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            Save Changes
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Current State */}
                <div className="space-y-3">
                  <Label 
                    htmlFor={`current-${pillarKey}`}
                    className="text-base font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 inline-block rounded"
                  >
                    Your Current State for {pillar}
                  </Label>
                  <Textarea
                    id={`current-${pillarKey}`}
                    placeholder={`Write your current state for this pillar...`}
                    value={currentStates[pillarKey] || ""}
                    onChange={(e) => onCurrentStateChange(pillarKey, e.target.value)}
                    rows={4}
                    className="resize-none border-2 border-green-400"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

