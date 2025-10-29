import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { OKRMappingSettings } from "./OKRMappingSettings";
import TaskCategorizationReview from "../TaskCategorizationReview";

export function OKRDashboard() {
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedKeyResults, setExpandedKeyResults] = useState<Set<string>>(new Set());
  const [showMappingSettings, setShowMappingSettings] = useState(false);
  const [showCategorizationReview, setShowCategorizationReview] = useState(false); // Fetch Objectives and Key Results
  const { data: objectives = [] } = trpc.okr.fetchObjectives.useQuery();
  const { data: keyResults = [] } = trpc.okr.fetchKeyResults.useQuery();

  // Fetch Needle Movers (This Week tasks)
  const { data: needleMovers = [] } = trpc.needleMovers.fetchBusiness.useQuery();

  // Fetch Roadmap tasks
  const { data: roadmapTasks = [] } = trpc.needleMovers.fetchRoadmap.useQuery();

  // Match Key Results to Objectives
  const objectivesWithKeyResults = objectives.map((objective: any) => {
    const matchedKeyResults = keyResults.filter((kr: any) => 
      kr.objectiveIds?.includes(objective.id)
    );
    console.log(`[OKR Dashboard] Objective "${objective.name}" has ${matchedKeyResults.length} Key Results`);
    console.log(`[OKR Dashboard] Key Results:`, matchedKeyResults);
    return {
      ...objective,
      keyResults: matchedKeyResults,
    };
  });
  
  console.log(`[OKR Dashboard] Total objectives: ${objectives.length}, Total Key Results: ${keyResults.length}`);
  console.log(`[OKR Dashboard] Needle Movers: ${needleMovers.length}, Roadmap: ${roadmapTasks.length}`);

  const toggleObjective = (id: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedObjectives(newExpanded);
  };

  const toggleKeyResult = (id: string) => {
    const newExpanded = new Set(expandedKeyResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedKeyResults(newExpanded);
  };

  // Helper to get current week start date
  const getCurrentWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  // Helper to format week date
  const formatWeekDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Group roadmap tasks by week
  const groupTasksByWeek = (tasks: any[]) => {
    const grouped: Record<string, any[]> = {};
    tasks.forEach(task => {
      if (task.targetWeek) {
        const weekKey = task.targetWeek;
        if (!grouped[weekKey]) {
          grouped[weekKey] = [];
        }
        grouped[weekKey].push(task);
      }
    });
    return grouped;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center relative">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <span className="text-5xl">📊</span>
          OKR Dashboard
        </h1>
        <p className="text-gray-600">
          Track your objectives with weekly execution and roadmap planning
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Debug: {objectives.length} objectives, {keyResults.length} key results, {needleMovers.length} needle movers, {roadmapTasks.length} roadmap tasks
        </p>
        <div className="absolute top-0 right-0 flex gap-2">
          <button
            onClick={() => setShowCategorizationReview(true)}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center gap-2"
          >
            🤖 Auto-Categorize
          </button>
          <button
            onClick={() => setShowMappingSettings(true)}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-2"
          >
            ⚙️ Configure Mappings
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {objectivesWithKeyResults.map((objective: any) => {
          const isObjectiveExpanded = expandedObjectives.has(objective.id);
          console.log(`[OKR Dashboard] Rendering objective "${objective.name}", expanded: ${isObjectiveExpanded}, keyResults count: ${objective.keyResults?.length || 0}`);
          if (objective.keyResults?.length > 0) {
            console.log(`[OKR Dashboard] Key Results for "${objective.name}":`, objective.keyResults.map((kr: any) => kr.name));
          }

          return (
            <div
              key={objective.id}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200"
            >
              {/* Objective Header */}
              <button
                onClick={() => toggleObjective(objective.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-lg">{objective.name}</h3>
                    {objective.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {objective.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-2xl">
                  {isObjectiveExpanded ? "▼" : "▶"}
                </span>
              </button>

              {/* Key Results */}
              {isObjectiveExpanded && (
                <div className="border-t border-gray-200">
                  {objective.keyResults?.map((keyResult: any) => {
                    const isKRExpanded = expandedKeyResults.has(keyResult.id);
                    
                    // Filter tasks linked to this Key Result
                    const thisWeekTasks = needleMovers.filter(
                      (task: any) => task.linkedKeyResultId === keyResult.id
                    );
                    
                    const roadmapTasksForKR = roadmapTasks.filter(
                      (task: any) => task.linkedKeyResultId === keyResult.id
                    );
                    
                    const groupedRoadmap = groupTasksByWeek(roadmapTasksForKR);

                    return (
                      <div
                        key={keyResult.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        {/* Key Result Header */}
                        <button
                          onClick={() => toggleKeyResult(keyResult.id)}
                          className="w-full p-4 pl-12 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 text-left">
                            <span className="text-xl">📊</span>
                            <div>
                              <h4 className="font-medium">{keyResult.name}</h4>
                              {keyResult.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {keyResult.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {thisWeekTasks.length} this week · {roadmapTasksForKR.length} roadmap
                            </span>
                            <span className="text-xl">
                              {isKRExpanded ? "▼" : "▶"}
                            </span>
                          </div>
                        </button>

                        {/* This Week & Roadmap Sections */}
                        {isKRExpanded && (
                          <div className="p-4 pl-16 bg-gray-50 space-y-6">
                            {/* This Week Section */}
                            <div>
                              <h5 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                                <span>📅</span> This Week
                              </h5>
                              {thisWeekTasks.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">
                                  No tasks scheduled for this week
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {thisWeekTasks.map((task: any) => (
                                    <div
                                      key={task.id}
                                      className="bg-white p-3 rounded border border-gray-200 hover:border-purple-300 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{task.name}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                          task.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                                          'bg-blue-100 text-blue-700'
                                        }`}>
                                          {task.priority}
                                        </span>
                                      </div>
                                      {task.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {task.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Roadmap Section */}
                            <div>
                              <h5 className="font-semibold text-teal-600 mb-3 flex items-center gap-2">
                                <span>🗺️</span> Roadmap
                              </h5>
                              {roadmapTasksForKR.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">
                                  No roadmap tasks planned
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {Object.entries(groupedRoadmap)
                                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                                    .map(([week, tasks]) => {
                                      const weekDate = new Date(week);
                                      return (
                                        <div key={week}>
                                          <h6 className="text-sm font-semibold text-gray-700 mb-2">
                                            Week of {formatWeekDate(weekDate)}
                                          </h6>
                                          <div className="space-y-2">
                                            {tasks.map((task: any) => (
                                              <div
                                                key={task.id}
                                                className="bg-white p-3 rounded border border-gray-200 hover:border-teal-300 transition-colors"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className="font-medium">{task.name}</span>
                                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                    task.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-blue-100 text-blue-700'
                                                  }`}>
                                                    {task.priority}
                                                  </span>
                                                </div>
                                                {task.description && (
                                                  <p className="text-sm text-gray-600 mt-1">
                                                    {task.description}
                                                  </p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showMappingSettings && (
        <OKRMappingSettings onClose={() => setShowMappingSettings(false)} />
      )}
      
      {showCategorizationReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TaskCategorizationReview onClose={() => setShowCategorizationReview(false)} />
          </div>
        </div>
      )}
    </div>
  );
}