/**
 * One-time migration script to copy ClickUp clients from Supabase to PostgreSQL
 * Run this script once after deploying the new table schema
 */

import { getDb } from './db';
import { clickupClients } from '../drizzle/schema';

const SUPABASE_URL = 'https://qmtlcqvjdgwdlzxnvjxn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdGxjcXZqZGd3ZGx6eG52anhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NjIxMzksImV4cCI6MjA1MjAzODEzOX0.4-lsQaKZxQDdqxNNL8-dOLRxOeQTmPHDfBjLKPyIXME';

interface SupabaseClient {
  id: string;
  clickup_task_id: string;
  clickup_url: string;
  client_name: string;
  brand_name: string | null;
  company: string | null;
  client_status: string;
  defcon: number;
  am_owner: string | null;
  ppc_owner: string | null;
  creative_owner: string | null;
  pod_owner: string | null;
  total_asins_fam: string | null;
  total_asins_ppc: string | null;
}

async function fetchClientsFromSupabase(): Promise<SupabaseClient[]> {
  console.log('[Migration] Fetching clients from Supabase...');
  
  const url = `${SUPABASE_URL}/rest/v1/clickup_clients?select=*&order=defcon.asc,client_status.asc`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch from Supabase: ${response.status} - ${errorText}`);
    }
    
    const clients = await response.json();
    console.log(`[Migration] Fetched ${clients.length} clients from Supabase`);
    return clients;
  } catch (error) {
    console.error('[Migration] Error fetching from Supabase:', error);
    throw error;
  }
}

async function migrateClients() {
  console.log('[Migration] Starting ClickUp clients migration...');
  
  try {
    // Fetch clients from Supabase
    const supabaseClients = await fetchClientsFromSupabase();
    
    if (supabaseClients.length === 0) {
      console.log('[Migration] No clients to migrate');
      return;
    }
    
    // Get database connection
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Insert clients into PostgreSQL
    console.log(`[Migration] Inserting ${supabaseClients.length} clients into PostgreSQL...`);
    
    for (const client of supabaseClients) {
      try {
        await db.insert(clickupClients).values({
          clickupTaskId: client.clickup_task_id,
          clickupUrl: client.clickup_url,
          clientName: client.client_name,
          brandName: client.brand_name,
          company: client.company,
          status: client.client_status,
          defcon: client.defcon,
          amOwner: client.am_owner,
          ppcOwner: client.ppc_owner,
          creativeOwner: client.creative_owner,
          podOwner: client.pod_owner,
          totalAsinsFam: client.total_asins_fam,
          totalAsinsPpc: client.total_asins_ppc,
        }).onConflictDoUpdate({
          target: clickupClients.clickupTaskId,
          set: {
            clickupUrl: client.clickup_url,
            clientName: client.client_name,
            brandName: client.brand_name,
            company: client.company,
            status: client.client_status,
            defcon: client.defcon,
            amOwner: client.am_owner,
            ppcOwner: client.ppc_owner,
            creativeOwner: client.creative_owner,
            podOwner: client.pod_owner,
            totalAsinsFam: client.total_asins_fam,
            totalAsinsPpc: client.total_asins_ppc,
            updatedAt: new Date(),
          },
        });
        
        console.log(`[Migration] ✓ Migrated client: ${client.client_name}`);
      } catch (error) {
        console.error(`[Migration] ✗ Failed to migrate client ${client.client_name}:`, error);
      }
    }
    
    console.log('[Migration] ✅ Migration completed successfully!');
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateClients()
    .then(() => {
      console.log('[Migration] Script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Script failed:', error);
      process.exit(1);
    });
}

export { migrateClients };
