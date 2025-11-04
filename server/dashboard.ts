import { ENV } from "./_core/env";

export interface DashboardTask {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  url: string;
  paymentLink: string;
  listType: 'personal' | 'ea' | 'pa';
}

/**
 * Fetch tasks from a ClickUp list
 */
async function fetchClickUpListTasks(listId: string, listType: 'personal' | 'ea' | 'pa'): Promise<DashboardTask[]> {
  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task?archived=false&subtasks=true`,
      {
        headers: {
          'Authorization': ENV.clickupApiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`[Dashboard] Failed to fetch ${listType} tasks:`, response.statusText);
      return [];
    }

    const data = await response.json();
    const tasks = data.tasks || [];

    console.log(`[Dashboard] ${listType} list: ${tasks.length} total tasks`);

    // Filter for incomplete tasks (not closed/complete/done)
    const incompleteTasks = tasks.filter((task: any) => {
      const statusLower = task.status?.status?.toLowerCase() || '';
      const isComplete = statusLower === 'complete' || statusLower === 'closed' || statusLower === 'done';
      return !isComplete;
    });

    console.log(`[Dashboard] ${listType} list: ${incompleteTasks.length} incomplete tasks`);

    return incompleteTasks.map((task: any) => {
      // Extract Payment Link custom field
      let paymentLink = '';
      const paymentLinkField = task.custom_fields?.find(
        (field: any) => field.name === 'Payment Link'
      );

      if (paymentLinkField) {
        // Try to parse rich text value first
        if (paymentLinkField.value_richtext) {
          try {
            const richText = JSON.parse(paymentLinkField.value_richtext);
            const bookmarkOp = richText.ops?.find((op: any) => op.insert?.bookmark);
            if (bookmarkOp?.insert?.bookmark?.url) {
              paymentLink = bookmarkOp.insert.bookmark.url;
            }
          } catch (e) {
            // If parsing fails, fall back to plain value
            paymentLink = paymentLinkField.value || '';
          }
        } else {
          paymentLink = paymentLinkField.value || '';
        }
      }

      return {
        id: task.id,
        name: task.name,
        description: task.description || '',
        status: task.status?.status || 'Unknown',
        priority: task.priority?.priority || 'None',
        dueDate: task.due_date || null,
        url: task.url || `https://app.clickup.com/t/${task.id}`,
        paymentLink: paymentLink.trim(),
        listType,
      };
    });
  } catch (error) {
    console.error(`[Dashboard] Error fetching ${listType} tasks:`, error);
    return [];
  }
}

/**
 * Fetch all dashboard tasks from Personal, EA, and PA lists
 */
export async function fetchDashboardTasks() {
  const [personalTasks, eaTasks, paTasks] = await Promise.all([
    fetchClickUpListTasks(ENV.clickupDashboardPersonalListId, 'personal'),
    fetchClickUpListTasks(ENV.clickupDashboardEAListId, 'ea'),
    fetchClickUpListTasks(ENV.clickupDashboardPAListId, 'pa'),
  ]);

  return {
    personal: personalTasks,
    ea: eaTasks,
    pa: paTasks,
    total: personalTasks.length + eaTasks.length + paTasks.length,
  };
}

/**
 * Move a task to a different ClickUp list
 */
export async function moveTaskToList(taskId: string, targetListId: string) {
  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': ENV.clickupApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ list: targetListId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Dashboard] Failed to move task:', errorData);
      throw new Error(errorData.err || 'Failed to move task');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Dashboard] Error moving task:', error);
    throw new Error(error.message || 'Failed to move task');
  }
}

/**
 * Update a ClickUp task status
 */
export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': ENV.clickupApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Dashboard] Failed to update task:', errorData);
      throw new Error(errorData.err || 'Failed to update task');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Dashboard] Error updating task:', error);
    throw new Error(error.message || 'Failed to update task');
  }
}

/**
 * Categorize tasks based on exact ClickUp Status field
 * Categories are ordered by priority: Urgent, Payments, Contracts, Recording, then others
 */
export function categorizeTasks(tasks: DashboardTask[]) {
  const categories = {
    urgent: [] as DashboardTask[],
    payments: [] as DashboardTask[],
    contracts: [] as DashboardTask[],
    recording: [] as DashboardTask[],
    individual: [] as DashboardTask[],
    bookkeeping: [] as DashboardTask[],
    todo: [] as DashboardTask[],
    slack: [] as DashboardTask[],
    personal: [] as DashboardTask[],
  };

  for (const task of tasks) {
    const statusUpper = task.status.toUpperCase();
    const priorityLower = task.priority.toLowerCase();

    // Urgent tasks (high priority - goes to top regardless of status)
    if (priorityLower === 'urgent' || priorityLower === 'high') {
      categories.urgent.push(task);
    }

    // Categorize based on exact ClickUp Status field
    // Priority order: Payments, Contracts, Recording, Individual, Bookkeeping, To-Do, Slack, Personal
    
    if (statusUpper === 'FINANCE TASKS') {
      categories.payments.push(task);
    }
    else if (statusUpper === 'CONTRACTS TO SIGN') {
      categories.contracts.push(task);
    }
    else if (statusUpper === 'RECORDING LIST') {
      categories.recording.push(task);
    }
    else if (statusUpper === 'INDIVIDUAL TASKS') {
      categories.individual.push(task);
    }
    else if (statusUpper === 'BOOKKEEPING TASKS') {
      categories.bookkeeping.push(task);
    }
    else if (statusUpper === 'TO-DO' || statusUpper === 'PENDING' || statusUpper === 'NOT STARTED') {
      categories.todo.push(task);
    }
    else if (statusUpper === 'SLACK TASKS') {
      categories.slack.push(task);
    }
    else if (statusUpper === 'PERSONAL TASKS' || statusUpper === 'IN PROGRESS') {
      categories.personal.push(task);
    }
    // Everything else goes to personal
    else {
      categories.personal.push(task);
    }
  }

  return categories;
}
