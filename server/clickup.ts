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

function mapPriorityToClickUp(priority: string): number {
  const map: Record<string, number> = {
    urgent: 1,
    high: 2,
    normal: 3,
    low: 4,
  };
  return map[priority.toLowerCase()] || 3;
}

function mapClickUpPriority(priority: any): "urgent" | "high" | "normal" | "low" {
  if (!priority) return "normal";
  const p = priority.priority?.toLowerCase() || "";
  if (p.includes("urgent")) return "urgent";
  if (p.includes("high")) return "high";
  if (p.includes("low")) return "low";
  return "normal";
}

function getCustomFieldValue(task: ClickUpTask, fieldName: string): any {
  const field = task.custom_fields?.find(
    (f) => f.name.toLowerCase() === fieldName.toLowerCase()
  );
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
  needleMover: NeedleMover
): Promise<string> {
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, skipping task creation");
    return "";
  }

  const response = await fetch(`${CLICKUP_API_URL}/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: needleMover.name,
      description: needleMover.description || "",
      priority: mapPriorityToClickUp(needleMover.priority),
      ...(needleMover.assigneeId && { assignees: [needleMover.assigneeId] }),
    }),
  });

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.id;
}

export async function moveTaskToList(
  taskId: string,
  targetListId: string
): Promise<void> {
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, skipping operation");
    return;
  }

  const response = await fetch(`${CLICKUP_API_URL}/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      list_id: targetListId,
    }),
  });

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${await response.text()}`);
  }
}

export async function updateNeedleMover(
  taskId: string,
  updates: Partial<NeedleMover>
): Promise<void> {
  if (!ENV.clickupApiKey) {
    console.warn("[ClickUp] API key not configured, skipping operation");
    return;
  }

  const body: any = {};

  if (updates.name) body.name = updates.name;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.priority) body.priority = mapPriorityToClickUp(updates.priority);

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
    console.warn("[ClickUp] API key not configured, skipping operation");
    return;
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
    console.warn("[ClickUp] API key not configured, returning empty team list");
    return [];
  }

  // Get list members (those with access to this specific list)
  const response = await fetch(`${CLICKUP_API_URL}/list/${listId}/member`, {
    headers: {
      Authorization: ENV.clickupApiKey,
    },
  });

  if (!response.ok) {
    console.warn(`[ClickUp] Failed to fetch list members: ${await response.text()}`);
    return [];
  }

  const data = await response.json();
  
  if (!data.members || !Array.isArray(data.members)) {
    return [];
  }

  return data.members
    .filter((m: any) => m.user && m.user.username) // Filter out users without usernames
    .map((m: any) => ({
      id: m.user.id,
      username: m.user.username,
      email: m.user.email,
      initials: m.user.initials || "",
    }));
}

