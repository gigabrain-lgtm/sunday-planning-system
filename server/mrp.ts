/**
 * MRP (My Real Profit) Integration
 * Handles inventory data from MRP API
 */

import { ENV } from "./_core/env";

export interface MRPInventoryItem {
  asin: string;
  sku: string;
  product_name: string;
  condition: string;
  your_price: string;
  mfn_fulfillable_quantity: number;
  afn_fulfillable_quantity: number;
  afn_unsellable_quantity: number;
  afn_reserved_quantity: number;
  afn_total_quantity: number;
  afn_inbound_working_quantity: number;
  afn_inbound_shipped_quantity: number;
  afn_inbound_receiving_quantity: number;
  snapshot_date: string;
}

export interface MRPInventoryResponse {
  products: MRPInventoryItem[];
  count: number;
  seller: string;
}

export interface MRPSeller {
  seller_name: string;
}

/**
 * Fetch inventory from MRP API
 */
export async function getMRPInventory(sellerName: string): Promise<MRPInventoryResponse> {
  const mrpApiUrl = ENV.MRP_API_URL || 'https://api.myrealprofit.com';
  const mrpApiKey = ENV.MRP_API_KEY;

  if (!mrpApiKey) {
    throw new Error('MRP_API_KEY not configured');
  }

  const url = `${mrpApiUrl}/inventory?seller=${encodeURIComponent(sellerName)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${mrpApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`MRP API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch list of sellers from MRP API
 */
export async function getMRPSellers(): Promise<MRPSeller[]> {
  const mrpApiUrl = ENV.MRP_API_URL || 'https://api.myrealprofit.com';
  const mrpApiKey = ENV.MRP_API_KEY;

  if (!mrpApiKey) {
    throw new Error('MRP_API_KEY not configured');
  }

  const url = `${mrpApiUrl}/sellers`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${mrpApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`MRP API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.sellers || [];
}
