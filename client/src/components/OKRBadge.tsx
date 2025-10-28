import React from 'react';

interface OKRBadgeProps {
  objectiveName?: string;
  keyResultName?: string;
  compact?: boolean;
}

const OBJECTIVE_COLORS: Record<string, string> = {
  'Objective 1': 'bg-blue-100 text-blue-800 border-blue-300',
  'Objective 2': 'bg-purple-100 text-purple-800 border-purple-300',
  'default': 'bg-gray-100 text-gray-800 border-gray-300',
};

function getObjectiveColor(objectiveName?: string): string {
  if (!objectiveName) return OBJECTIVE_COLORS.default;
  
  // Match by objective name
  for (const [key, color] of Object.entries(OBJECTIVE_COLORS)) {
    if (objectiveName.includes(key)) {
      return color;
    }
  }
  
  return OBJECTIVE_COLORS.default;
}

export function OKRBadge({ objectiveName, keyResultName, compact = false }: OKRBadgeProps) {
  if (!objectiveName && !keyResultName) {
    return null;
  }

  const colorClass = getObjectiveColor(objectiveName);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${colorClass}`}>
        <span>🎯</span>
        <span className="font-medium truncate max-w-[200px]">
          {keyResultName || objectiveName}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-0.5 px-3 py-2 rounded-lg border ${colorClass}`}>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span>🎯</span>
        <span>OKR Linkage</span>
      </div>
      {objectiveName && (
        <div className="text-xs">
          <span className="font-medium">Objective:</span> {objectiveName}
        </div>
      )}
      {keyResultName && (
        <div className="text-xs">
          <span className="font-medium">Key Result:</span> {keyResultName}
        </div>
      )}
    </div>
  );
}

