import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function Visualization() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  // Fetch existing visualization and history
  const { data: visualization, isLoading, refetch } = trpc.visualization.get.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.visualization.getHistory.useQuery();
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
      refetch(); // Refresh to get new updated timestamp
    } catch (error) {
      console.error("Error saving visualization:", error);
      toast.error("Failed to save visualization");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-purple-600">
            📍 Future Visualization
          </h2>
          {history && history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              {showHistory ? "Hide History" : `View History (${history.length})`}
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          Write deeply about where you want to be in the future. This visualization will be sent to your Slack channel every weekday to keep you focused on your vision.
        </p>

        {showHistory && history && history.length > 0 && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">📜 Version History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded border border-gray-200 hover:border-purple-300 cursor-pointer transition-colors"
                  onClick={() => setSelectedHistoryItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      {formatDate(item.versionDate)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContent(item.content);
                        setSelectedHistoryItem(null);
                        toast.success("Restored from history - don't forget to save!");
                      }}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {item.content.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedHistoryItem && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">
                Version from {formatDate(selectedHistoryItem.versionDate)}
              </h3>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Close
              </button>
            </div>
            <div className="text-sm text-blue-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {selectedHistoryItem.content}
            </div>
            <button
              onClick={() => {
                setContent(selectedHistoryItem.content);
                setSelectedHistoryItem(null);
                toast.success("Restored from history - don't forget to save!");
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Restore This Version
            </button>
          </div>
        )}

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
            Last updated: {formatDate(visualization.updatedAt)}
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

      {history && history.length > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📊 Your Progress</h3>
          <p className="text-sm text-green-800">
            You've updated your visualization <strong>{history.length}</strong> time{history.length !== 1 ? 's' : ''}. 
            Each update shows your evolving vision and commitment to your future. Keep refining and dreaming bigger! 🚀
          </p>
        </div>
      )}
    </div>
  );
}
