/**
 * Fulfilment Module
 * Handles MRP inventory and ClickUp task creation for product optimization
 */

import { ENV } from "./_core/env";
import * as clickup from "./clickup";
import { getMRPInventory, getMRPSellers, type MRPInventoryItem } from "./mrp";

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const CLICKUP_DEFAULT_LIST_ID = '901305874515'; // Creative Task Templates

/**
 * Template mapping for inventory actions
 */
export const INVENTORY_TEMPLATES = {
  'Main Image': '86a8m8nz1', // 📍 [ASIN] Listing Images Optimization
  'Gallery Images': '86a8m8nz1', // Same template as Main Image
  'A+ Content': '86a5m44f8', // 📍 [ASIN] A+ Optimization
  'Change Price': null, // No template, create regular task
  'Apply Coupon/Discount': null, // No template, create regular task
};

/**
 * Format product data for task description
 */
function formatProductDescription(product: MRPInventoryItem): string {
  return `
**Product Details:**
- **ASIN:** ${product.asin}
- **SKU:** ${product.sku}
- **Title:** ${product.product_name}
- **Price:** $${product.your_price}
- **Sellable Quantity:** ${product.afn_fulfillable_quantity}
- **Total Quantity:** ${product.afn_total_quantity}
- **Amazon Link:** https://www.amazon.com/dp/${product.asin}

---
*Task created automatically from MRP Inventory dashboard*
  `.trim();
}

/**
 * Create a ClickUp task for product optimization
 */
export async function createInventoryTask(params: {
  product: MRPInventoryItem;
  taskType: keyof typeof INVENTORY_TEMPLATES;
  clientName?: string;
}): Promise<any> {
  const { product, taskType, clientName } = params;
  const clickupApiKey = ENV.CLICKUP_API_KEY;

  if (!clickupApiKey) {
    throw new Error('ClickUp API key not configured');
  }

  const templateId = INVENTORY_TEMPLATES[taskType];
  const listId = CLICKUP_DEFAULT_LIST_ID;

  const taskData = {
    name: `${taskType} - ${product.asin} - ${product.product_name.substring(0, 50)}`,
    description: formatProductDescription(product),
    tags: [taskType.toLowerCase().replace(/\s+/g, '-'), 'mrp-inventory', product.asin.toLowerCase()],
    status: 'Open',
  };

  // If there's a template, create from template
  if (templateId) {
    return await createTaskFromTemplate(listId, templateId, taskData, clickupApiKey);
  } else {
    // Create regular task
    return await createTask(listId, taskData, clickupApiKey);
  }
}

/**
 * Create a task from a template
 */
async function createTaskFromTemplate(
  listId: string,
  templateId: string,
  taskData: any,
  apiKey: string
): Promise<any> {
  try {
    // Step 1: Get the template task
    const templateResponse = await fetch(
      `${CLICKUP_API_BASE}/task/${templateId}`,
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }

    const template = await templateResponse.json();

    // Step 2: Create a new task based on the template
    const newTaskData = {
      name: taskData.name,
      description: taskData.description || template.description || '',
      assignees: taskData.assignees || [],
      tags: taskData.tags || template.tags?.map((t: any) => t.name) || [],
      status: taskData.status || template.status?.status,
      priority: taskData.priority || template.priority?.id,
    };

    const createResponse = await fetch(
      `${CLICKUP_API_BASE}/list/${listId}/task`,
      {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskData),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create task: ${errorText}`);
    }

    return await createResponse.json();
  } catch (error) {
    console.error('❌ Error creating task from template:', error);
    throw error;
  }
}

/**
 * Create a regular task (without template)
 */
async function createTask(
  listId: string,
  taskData: any,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch(
      `${CLICKUP_API_BASE}/list/${listId}/task`,
      {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create task: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error creating task:', error);
    throw error;
  }
}

/**
 * Get MRP sellers list
 */
export async function getSellers() {
  return await getMRPSellers();
}

/**
 * Get inventory for a specific seller
 */
export async function getInventory(sellerName: string) {
  return await getMRPInventory(sellerName);
}
