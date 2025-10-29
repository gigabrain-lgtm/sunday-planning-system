import { useState, useEffect } from "react";
import { trpc } from "../trpc";
import { toast } from "react-hot-toast";

export function Visualization() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing visualization
  const { data: visualization, isLoading } = trpc.visualization.get.useQuery();
  const saveMutation = trpc.visualization.save.useMutation();

  // Load existing content when data is fetched
  useEffect(() => {
    if (visualization?.content) {
      setContent(visualization.content);
    }
  }, [visualization]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please write your visualization before saving");
      return;
    }

    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({ content });
      toast.success("Visualization saved successfully!");
    } catch (error) {
      console.error("Error saving visualization:", error);
      toast.error("Failed to save visualization");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">
          📍 Future Visualization
        </h2>
        <p className="text-gray-600 mb-6">
          Write deeply about where you want to be in the future. This visualization will be sent to your Slack channel every weekday to keep you focused on your vision.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Future Vision
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your future in vivid detail... Where are you? What have you achieved? How do you feel? What does your life look like?"
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            style={{ fontFamily: "inherit" }}
          />
          <div className="text-sm text-gray-500 mt-2">
            {content.length} characters
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            💬 This will be posted to Slack every weekday (Monday-Friday)
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isSaving || !content.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isSaving ? "Saving..." : "Save Visualization"}
          </button>
        </div>

        {visualization?.updatedAt && (
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date(visualization.updatedAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Writing Your Visualization</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Write in present tense as if you're already living your future</li>
          <li>• Be specific about details - what you see, hear, feel</li>
          <li>• Include your emotions and how achieving your goals makes you feel</li>
          <li>• Describe your environment, relationships, and daily life</li>
          <li>• Make it inspiring and motivating to read every morning</li>
        </ul>
      </div>
    </div>
  );
}
