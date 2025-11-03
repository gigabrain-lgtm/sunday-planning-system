import { ENV } from "./_core/env";

const CLICKUP_API_URL = "https://api.clickup.com/api/v2";

export interface HiringPriority {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: {
    id: string;
    priority: string;
    color: string;
  } | null;
  assignees?: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  dueDate?: string;
  customFields?: Record<string, any>;
}

function getCustomFieldValue(task: any, fieldName: string): any {
  const field = task.custom_fields?.find((f: any) => f.name === fieldName);
  return field?.value;
}

export async function fetchHiringPriorities(): Promise<HiringPriority[]> {
  console.log(`[Hiring] fetchHiringPriorities called with listId: ${ENV.clickupHiringListId}`);
  
  if (!ENV.clickupApiKey) {
    console.warn("[Hiring] API key not configured, returning empty list");
    return [];
  }

  if (!ENV.clickupHiringListId) {
    console.warn("[Hiring] Hiring list ID not configured, returning empty list");
    return [];
  }

  // Fetch all tasks with pagination
  let allTasks: any[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${CLICKUP_API_URL}/list/${ENV.clickupHiringListId}/task?include_closed=false&page=${page}`,
      {
        headers: {
          Authorization: ENV.clickupApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Hiring] API error for list ${ENV.clickupHiringListId}: ${response.status} - ${errorText}`);
      throw new Error(`ClickUp API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const tasks = data.tasks;
    
    if (tasks.length === 0) {
      hasMore = false;
    } else {
      allTasks = allTasks.concat(tasks);
      page++;
      
      // Safety check: stop after 10 pages (1000 tasks) to prevent infinite loops
      if (page >= 10) {
        console.warn(`[Hiring] Reached maximum page limit (10) for list ${ENV.clickupHiringListId}`);
        hasMore = false;
      }
    }
  }

  console.log(`[Hiring] Fetched ${allTasks.length} tasks from list ${ENV.clickupHiringListId}`);

  return allTasks.map((task: any) => {
    const customFields: Record<string, any> = {};
    if (task.custom_fields) {
      task.custom_fields.forEach((field: any) => {
        customFields[field.name] = field.value;
      });
    }

    return {
      id: task.id,
      name: task.name,
      description: task.description || "",
      status: task.status?.status || "open",
      priority: task.priority,
      assignees: task.assignees || [],
      dueDate: task.due_date ? new Date(parseInt(task.due_date)).toISOString() : undefined,
      customFields,
    };
  });
}

export async function updateHiringPriority(
  taskId: string,
  updates: {
    name?: string;
    description?: string;
    status?: string;
    priority?: number;
    assigneeId?: number;
    dueDate?: string;
  }
): Promise<void> {
  if (!ENV.clickupApiKey) {
    throw new Error("[Hiring] API key not configured");
  }

  const body: any = {};
  if (updates.name) body.name = updates.name;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.status) body.status = updates.status;
  if (updates.priority) body.priority = updates.priority;
  if (updates.assigneeId !== undefined) {
    body.assignees = updates.assigneeId ? [{ add: updates.assigneeId }] : [];
  }
  if (updates.dueDate) {
    body.due_date = new Date(updates.dueDate).getTime();
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

export async function createHiringPriority(data: {
  name: string;
  description?: string;
  priority?: number;
  assigneeId?: number;
  dueDate?: string;
}): Promise<HiringPriority> {
  if (!ENV.clickupApiKey) {
    throw new Error("[Hiring] API key not configured");
  }

  if (!ENV.clickupHiringListId) {
    throw new Error("[Hiring] Hiring list ID not configured");
  }

  const response = await fetch(`${CLICKUP_API_URL}/list/${ENV.clickupHiringListId}/task`, {
    method: "POST",
    headers: {
      Authorization: ENV.clickupApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description || "",
      priority: data.priority || 3,
      assignees: data.assigneeId ? [data.assigneeId] : [],
      due_date: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
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
    status: task.status?.status || "open",
    priority: task.priority,
    assignees: task.assignees || [],
    dueDate: task.due_date ? new Date(parseInt(task.due_date)).toISOString() : undefined,
    customFields: {},
  };
}
