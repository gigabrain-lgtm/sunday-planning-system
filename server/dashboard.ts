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
 * Categorize tasks based on ClickUp Status field
 */
export function categorizeTasks(tasks: DashboardTask[]) {
  const categories = {
    urgent: [] as DashboardTask[],
    contracts: [] as DashboardTask[],
    approvals: [] as DashboardTask[],
    payments: [] as DashboardTask[],
    bookkeeping: [] as DashboardTask[],
    recording: [] as DashboardTask[],
    todo: [] as DashboardTask[],
    slack: [] as DashboardTask[],
    personal: [] as DashboardTask[],
  };

  for (const task of tasks) {
    const statusLower = task.status.toLowerCase();
    const priorityLower = task.priority.toLowerCase();

    // Categorize based on ClickUp Status field
    
    // Urgent tasks (high priority regardless of status)
    if (priorityLower === 'urgent' || priorityLower === 'high') {
      categories.urgent.push(task);
    }

    // Contracts to Sign (based on status)
    if (statusLower.includes('contract') || statusLower === 'contracts to sign') {
      categories.contracts.push(task);
    }
    // Approval Tasks (based on status)
    else if (statusLower.includes('approval') || statusLower === 'individual tasks') {
      categories.approvals.push(task);
    }
    // Finance/Payment Tasks (based on status)
    else if (statusLower.includes('finance') || statusLower.includes('payment') || task.paymentLink) {
      categories.payments.push(task);
    }
    // Bookkeeping Tasks (based on status)
    else if (statusLower.includes('bookkeep') || statusLower.includes('accounting')) {
      categories.bookkeeping.push(task);
    }
    // Recording List (based on status)
    else if (statusLower.includes('recording')) {
      categories.recording.push(task);
    }
    // Slack Tasks (based on status)
    else if (statusLower.includes('slack')) {
      categories.slack.push(task);
    }
    // To-Do (based on status)
    else if (statusLower.includes('to do') || statusLower.includes('todo') || statusLower === 'pending') {
      categories.todo.push(task);
    }
    // In Progress (general category)
    else if (statusLower === 'in progress') {
      categories.personal.push(task);
    }
    // Everything else goes to personal
    else {
      categories.personal.push(task);
    }
  }

  return categories;
}
