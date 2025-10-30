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
  linkedKeyResultId?: string;
  linkedKeyResultName?: string;
  linkedObjectiveId?: string;
  linkedObjectiveName?: string;
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

export function mapClickUpPriority(priority: ClickUpTask["priority"]): NeedleMover["priority"] {
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
  console.log(`[ClickUp] fetchNeedleMovers called with listId: ${listId}`);
  
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, returning empty list");
    return [];
  }

  // Fetch all tasks with pagination
  let allTasks: ClickUpTask[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${CLICKUP_API_URL}/list/${listId}/task?include_closed=false&page=${page}`,
      {
        headers: {
          Authorization: ENV.clickupApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ClickUp] API error for list ${listId}: ${response.status} - ${errorText}`);
      throw new Error(`ClickUp API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const tasks: ClickUpTask[] = data.tasks;
    
    if (tasks.length === 0) {
      hasMore = false;
    } else {
      allTasks = allTasks.concat(tasks);
      page++;
      
      // Safety check: stop after 10 pages (1000 tasks) to prevent infinite loops
      if (page >= 10) {
        console.warn(`[ClickUp] Reached maximum page limit (10) for list ${listId}`);
        hasMore = false;
      }
    }
  }

  console.log(`[ClickUp] Fetched ${allTasks.length} tasks from list ${listId}`);
  const tasks = allTasks;

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

  console.log(`[ClickUp] fetchRoadmapTasks - Using list ID: ${ENV.clickupRoadmapListId}`);
  
  try {
    const tasks = await fetchNeedleMovers(ENV.clickupRoadmapListId);
    console.log(`[ClickUp] fetchRoadmapTasks - Successfully fetched ${tasks.length} tasks`);
    return tasks;
  } catch (error) {
    console.error(`[ClickUp] fetchRoadmapTasks - Error:`, error);
    return [];
  }
}

export async function getTask(taskId: string): Promise<any> {
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  const url = `${CLICKUP_API_URL}/task/${taskId}`;
  console.log(`[ClickUp] Fetching task: ${url}`);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: ENV.clickupApiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ClickUp] Failed to fetch task: ${response.status} ${errorText}`);
    throw new Error(`Failed to fetch task: ${errorText}`);
  }
  
  const task = await response.json();
  console.log(`[ClickUp] Fetched task: ${task.name} (${task.id})`);
  return task;
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




export async function linkTasks(
  taskId: string,
  linkedTaskId: string,
  linkType: string = 'relates to'
): Promise<void> {
  console.log(`[ClickUp] linkTasks called: taskId=${taskId}, linkedTaskId=${linkedTaskId}, linkType=${linkType}`);
  
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  // ClickUp API endpoint for adding task dependencies/links
  const url = `${CLICKUP_API_URL}/task/${taskId}/link/${linkedTaskId}`;
  console.log(`[ClickUp] Making POST request to: ${url}`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    // No body required for Add Task Link endpoint
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ClickUp] Failed to link tasks: ${response.status} ${errorText}`);
    throw new Error(`Failed to link tasks: ${errorText}`);
  }
  
  console.log(`[ClickUp] Successfully linked task ${taskId} to ${linkedTaskId}`);
}



export async function getTaskRelationships(taskId: string): Promise<any[]> {
  console.log(`[ClickUp] getTaskRelationships called for taskId: ${taskId}`);
  
  if (!ENV.clickupApiKey) {
    throw new Error("[ClickUp] API key not configured");
  }

  // Fetch task details which includes relationships
  const url = `${CLICKUP_API_URL}/task/${taskId}`;
  console.log(`[ClickUp] Fetching task details from: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      Authorization: ENV.clickupApiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ClickUp] Failed to fetch task: ${response.status} ${errorText}`);
    throw new Error(`Failed to fetch task relationships: ${errorText}`);
  }

  const data = await response.json();
  console.log(`[ClickUp] Task data keys:`, Object.keys(data));
  console.log(`[ClickUp] Relationships field:`, data.relationships);
  console.log(`[ClickUp] Linked tasks field:`, data.linked_tasks);
  
  // Check both possible field names
  const relationships = data.relationships || data.linked_tasks || [];
  console.log(`[ClickUp] Returning ${relationships.length} relationships`);
  
  return relationships;
}

export async function enrichWithOKRLinkage(
  tasks: NeedleMover[],
  keyResults: KeyResult[],
  objectives: Objective[]
): Promise<NeedleMover[]> {
  console.log(`[OKR Enrichment] Starting enrichment for ${tasks.length} tasks`);
  console.log(`[OKR Enrichment] ${keyResults.length} Key Results available`);
  console.log(`[OKR Enrichment] ${objectives.length} Objectives available`);
  
  // OPTIMIZATION: Skip individual API calls for now - they're too slow
  // Instead, rely on database mappings which are much faster
  // Tasks without linkedObjectiveName will be available for Auto-Categorize
  
  console.log(`[OKR Enrichment] Skipping relationship API calls for performance`);
  console.log(`[OKR Enrichment] Tasks without OKR linkage will be available for categorization`);
  
  return tasks;
}

// Trigger redeploy to load new CLICKUP_ROADMAP_LIST_ID env var

