/**
 * MRP (My Real Profit) Integration
 * Handles inventory data from MRP PostgreSQL database
 */

import { Pool } from 'pg';
import { ENV } from "./_core/env";

// MRP Database connection pool
let mrpPool: Pool | null = null;

function getMRPPool(): Pool {
  if (!mrpPool) {
    mrpPool = new Pool({
      host: ENV.MRP_DB_HOST,
      port: parseInt(ENV.MRP_DB_PORT || '5432'),
      user: ENV.MRP_DB_USER,
      password: ENV.MRP_DB_PASSWORD,
      database: ENV.MRP_DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return mrpPool;
}

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
  id: number;
  name: string;
  selling_partner_id: string;
  state: string;
  advertising_data_initialized: boolean;
  financial_data_initialized: boolean;
}

/**
 * Fetch inventory from MRP database
 */
export async function getMRPInventory(sellerName: string): Promise<MRPInventoryResponse> {
  const pool = getMRPPool();

  // First, get the amazon_selling_partner_id for this seller
  const sellerResult = await pool.query(`
    SELECT id, name FROM v1_amazon_selling_partner_view
    WHERE name = $1
    LIMIT 1
  `, [sellerName]);

  if (sellerResult.rows.length === 0) {
    throw new Error('Seller not found');
  }

  const sellerId = sellerResult.rows[0].id;

  // Query to get inventory data for the seller
  const result = await pool.query(`
    SELECT 
      sku,
      asin,
      product_name,
      condition,
      your_price,
      mfn_fulfillable_quantity,
      afn_fulfillable_quantity,
      afn_unsellable_quantity,
      afn_reserved_quantity,
      afn_total_quantity,
      afn_inbound_working_quantity,
      afn_inbound_shipped_quantity,
      afn_inbound_receiving_quantity,
      snapshot_date
    FROM v1_amazon_inventory_unsuppressed_view
    WHERE amazon_selling_partner_id = $1
    AND snapshot_date = (SELECT MAX(snapshot_date) FROM v1_amazon_inventory_unsuppressed_view WHERE amazon_selling_partner_id = $1)
    ORDER BY afn_total_quantity DESC
    LIMIT 100
  `, [sellerId]);

  return {
    products: result.rows,
    count: result.rows.length,
    seller: sellerName
  };
}

/**
 * Fetch list of sellers from MRP database
 */
export async function getMRPSellers(): Promise<MRPSeller[]> {
  const pool = getMRPPool();

  const result = await pool.query(`
    SELECT 
      id,
      name,
      selling_partner_id,
      state,
      advertising_data_initialized,
      financial_data_initialized
    FROM v1_amazon_selling_partner_view
    WHERE name IS NOT NULL
    ORDER BY name;
  `);

  return result.rows;
}
