import { ENV } from "./_core/env";

const CLICKUP_API_URL = "https://api.clickup.com/api/v2";

export interface TeamMember {
  id: number;
  username: string;
  email: string;
  initials: string;
}

export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  priority?: {
    id: string;
    priority: string;
    color: string;
  } | null;
  custom_fields?: Array<{
    id: string;
    name: string;
    value?: any;
  }>;
  assignees?: Array<{
    id: number;
    username: string;
    email: string;
  }>;
}

export interface NeedleMover {
  id?: string;
  name: string;
  description?: string;
  priority: "urgent" | "high" | "normal" | "low";
  confidenceLevel?: number;
  lastWeekConfidence?: number;
  assigneeId?: number;
  assigneeName?: string;
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  status: string;
}

export interface Subtask {
  id: string;
  name: string;
  description: string;
  status: string;
  assignees: Array<{
    id: number;
    username: string;
  }>;
}

export interface KeyResult {
  id: string;
  name: string;
  description: string;
  status: string;
  target?: number;
  actual?: number;
  baseline?: number;
  objectiveIds?: string[];
  assignees: Array<{
    id: number;
    username: string;
  }>;
  subtasks: Subtask[];
}

function mapPriorityToClickUp(priority: string): number {
  const map: Record<string, number> = {
    urgent: 1,
    high: 2,
    normal: 3,
    low: 4,
  };
  return map[priority] || 3;
}

function mapClickUpPriority(priority: ClickUpTask["priority"]): NeedleMover["priority"] {
  if (!priority) return "normal";
  const map: Record<string, NeedleMover["priority"]> = {
    "1": "urgent",
    "2": "high",
    "3": "normal",
    "4": "low",
  };
  return map[priority.id] || "normal";
}

function getCustomFieldValue(task: ClickUpTask, fieldName: string): any {
  const field = task.custom_fields?.find((f) => f.name === fieldName);
  return field?.value;
}

export async function fetchNeedleMovers(listId: string): Promise<NeedleMover[]> {
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, returning empty list");
    return [];
  }

  const response = await fetch(
    `${CLICKUP_API_URL}/list/${listId}/task?include_closed=false`,
    {
      headers: {
        Authorization: ENV.clickupApiKey,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }

  const data = await response.json();
  const tasks: ClickUpTask[] = data.tasks;

  return tasks.map((task: ClickUpTask) => ({
    id: task.id,
    name: task.name,
    description: task.description || "",
    priority: mapClickUpPriority(task.priority),
    confidenceLevel: getCustomFieldValue(task, "Confidence Level"),
    lastWeekConfidence: getCustomFieldValue(task, "Last Week Confidence"),
    assigneeId: task.assignees?.[0]?.id,
    assigneeName: task.assignees?.[0]?.username,
  }));
}

export async function createNeedleMover(
  listId: string,
  data: {
    name: string;
    description?: string;
    priority: string;
    confidenceLevel?: number;
    lastWeekConfidence?: number;
    assigneeId?: number;
  }
): Promise<NeedleMover> {
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  const response = await fetch(`${CLICKUP_API_URL}/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description || "",
      priority: mapPriorityToClickUp(data.priority),
      assignees: data.assigneeId ? [data.assigneeId] : [],
    }),
  });

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }

  const task = await response.json();
  return {
    id: task.id,
    name: task.name,
    description: task.description || "",
    priority: data.priority as NeedleMover["priority"],
    assigneeId: data.assigneeId,
  };
}

export async function fetchRoadmapTasks(): Promise<NeedleMover[]> {
  if (!ENV.clickupRoadmapListId) {
    console.warn("[ClickUp] Roadmap list ID not configured");
    return [];
  }

  return fetchNeedleMovers(ENV.clickupRoadmapListId);
}

export async function moveTaskToList(
  taskId: string,
  targetListId: string
): Promise<void> {
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  const response = await fetch(`${CLICKUP_API_URL}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      list_id: targetListId,
      parent: null, // Remove parent relationship to convert subtask to standalone task
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to move task: ${errorText}`);
  }
}

export async function updateNeedleMover(
  taskId: string,
  updates: {
    name?: string;
    description?: string;
    priority?: string;
    confidenceLevel?: number;
    lastWeekConfidence?: number;
    assigneeId?: number;
  }
): Promise<void> {
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  const body: any = {};
  if (updates.name) body.name = updates.name;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.priority) body.priority = mapPriorityToClickUp(updates.priority);
  if (updates.assigneeId !== undefined) {
    body.assignees = updates.assigneeId ? [{ add: updates.assigneeId }] : [];
  }

  const response = await fetch(`${CLICKUP_API_URL}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }
}

export async function markTaskComplete(taskId: string): Promise<void> {
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  const response = await fetch(`${CLICKUP_API_URL}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "complete",
    }),
  });

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }
}

export async function getTeamMembers(listId: string): Promise<TeamMember[]> {
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured");
    return [];
  }

  const response = await fetch(`${CLICKUP_API_URL}/list/${listId}/member`, {
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("[ClickUp] Failed to fetch team members:", await response.text());
    return [];
  }

  const data = await response.json();
  return data.members || [];
}

// OKR Functions
export async function fetchObjectives(): Promise<Objective[]> {
  const OBJECTIVES_LIST_ID = "901315739969";
  
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, returning empty list");
    return [];
  }

  const response = await fetch(
    `${CLICKUP_API_URL}/list/${OBJECTIVES_LIST_ID}/task?include_closed=false`,
    {
      headers: {
        Authorization: ENV.clickupApiKey,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }

  const data = await response.json();
  const tasks: ClickUpTask[] = data.tasks;

  return tasks.map((task) => ({
    id: task.id,
    name: task.name,
    description: task.description || "",
    status: task.priority?.priority || "to do",
  }));
}

export async function fetchKeyResults(): Promise<KeyResult[]> {
  const KEY_RESULTS_LIST_ID = "901315739968";
  
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, returning empty list");
    return [];
  }

  // Fetch all tasks including subtasks
  const response = await fetch(
    `${CLICKUP_API_URL}/list/${KEY_RESULTS_LIST_ID}/task?subtasks=true&include_closed=false`,
    {
      headers: {
        Authorization: ENV.clickupApiKey,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }

  const data = await response.json();
  const allTasks: ClickUpTask[] = data.tasks;
  
  // Separate parent tasks (key results) from subtasks
  const parentTasks = allTasks.filter(t => !(t as any).parent);
  const subtasksList = allTasks.filter(t => (t as any).parent);

  return parentTasks.map((task) => {
    // Find subtasks for this key result
    const taskSubtasks = subtasksList
      .filter(st => (st as any).parent === task.id)
      .map(st => ({
        id: st.id,
        name: st.name,
        description: st.description || "",
        status: st.priority?.priority || "to do",
        assignees: st.assignees?.map((a) => ({
          id: a.id,
          username: a.username,
        })) || [],
      }));
    
    const objectivesField = getCustomFieldValue(task, "Objectives");
    const objectiveIds = objectivesField ? (Array.isArray(objectivesField) ? objectivesField : [objectivesField]) : [];
    
    return {
      id: task.id,
      name: task.name,
      description: task.description || "",
      status: task.priority?.priority || "to do",
      target: getCustomFieldValue(task, "Target"),
      actual: getCustomFieldValue(task, "Actual"),
      baseline: getCustomFieldValue(task, "Baseline"),
      objectiveIds,
      assignees: task.assignees?.map((a) => ({
        id: a.id,
        username: a.username,
      })) || [],
      subtasks: taskSubtasks,
    };
  });
}


