import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";

export function OKRMappingSettings({ onClose }: { onClose: () => void }) {
  const { data: objectives } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults } = trpc.okr.fetchKeyResults.useQuery();
  const { data: mappings, refetch: refetchMappings } = trpc.okr.getKeyResultObjectiveMappings.useQuery();
  const saveMappingMutation = trpc.okr.saveKeyResultObjectiveMapping.useMutation();

  const [localMappings, setLocalMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mappings) {
      const mappingMap: Record<string, string> = {};
      mappings.forEach((m: any) => {
        mappingMap[m.keyResultId] = m.objectiveId;
      });
      setLocalMappings(mappingMap);
    }
  }, [mappings]);

  const handleMappingChange = (keyResultId: string, objectiveId: string) => {
    setLocalMappings((prev) => ({
      ...prev,
      [keyResultId]: objectiveId,
    }));
  };

  const handleSave = async () => {
    alert("handleSave called! localMappings keys: " + Object.keys(localMappings).length);
    try {
      console.log("[OKR Mappings] Saving mappings:", localMappings);
      // Save all mappings
      for (const [keyResultId, objectiveId] of Object.entries(localMappings)) {
        if (objectiveId) {
          console.log(`[OKR Mappings] Saving: ${keyResultId} -> ${objectiveId}`);
          await saveMappingMutation.mutateAsync({ keyResultId, objectiveId });
          console.log(`[OKR Mappings] Saved successfully`);
        }
      }
      await refetchMappings();
      alert("Mappings saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving mappings:", error);
      alert("Failed to save mappings");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            ⚙️ Configure Key Result → Objective Mappings
          </h2>
          <p className="text-gray-600 mt-2">
            Assign each Key Result to an Objective. This will determine how they're displayed in the OKR Dashboard.
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {keyResults?.map((kr: any) => (
              <div key={kr.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{kr.name}</p>
                  <p className="text-sm text-gray-500">{kr.description}</p>
                </div>
                <div className="w-64">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={localMappings[kr.id] || ""}
                    onChange={(e) => handleMappingChange(kr.id, e.target.value)}
                  >
                    <option value="">-- Select Objective --</option>
                    {objectives?.map((obj: any) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              alert("Button clicked! localMappings: " + JSON.stringify(localMappings));
              await handleSave();
            }}
            disabled={saveMappingMutation.isPending}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMappingMutation.isPending ? "Saving..." : "Save Mappings"}
          </button>
        </div>
      </div>
    </div>
  );
}

