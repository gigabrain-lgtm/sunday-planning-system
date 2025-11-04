import { ENV } from "./_core/env";

const AIRTABLE_API_KEY = ENV.airtableApiKey;
const AIRTABLE_BASE_ID = ENV.airtableBaseId;

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

/**
 * Fetch all tables from the Airtable base
 */
export async function fetchBaseTables() {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Airtable] Failed to fetch tables:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch tables');
    }

    const data = await response.json();
    return data.tables || [];
  } catch (error: any) {
    console.error('[Airtable] Error fetching tables:', error);
    throw new Error(error.message || 'Failed to fetch tables');
  }
}

/**
 * Fetch records from a specific table
 */
export async function fetchTableRecords(tableIdOrName: string, maxRecords: number = 100) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableIdOrName)}?maxRecords=${maxRecords}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Airtable] Failed to fetch records from ${tableIdOrName}:`, errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch records');
    }

    const data: AirtableResponse = await response.json();
    return data.records || [];
  } catch (error: any) {
    console.error(`[Airtable] Error fetching records from ${tableIdOrName}:`, error);
    throw new Error(error.message || 'Failed to fetch records');
  }
}

/**
 * Fetch all marketing data from all tables
 */
export async function fetchAllMarketingData() {
  try {
    // First, get all tables in the base
    const tables = await fetchBaseTables();
    
    console.log('[Airtable] Found tables:', tables.map((t: any) => t.name));

    // Fetch records from each table
    const tableData = await Promise.all(
      tables.map(async (table: any) => {
        try {
          const records = await fetchTableRecords(table.id, 100);
          return {
            tableId: table.id,
            tableName: table.name,
            records,
            fields: table.fields || [],
          };
        } catch (error) {
          console.error(`[Airtable] Failed to fetch data from table ${table.name}:`, error);
          return {
            tableId: table.id,
            tableName: table.name,
            records: [],
            fields: [],
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return {
      tables: tableData,
      totalTables: tables.length,
    };
  } catch (error: any) {
    console.error('[Airtable] Error fetching marketing data:', error);
    throw new Error(error.message || 'Failed to fetch marketing data');
  }
}
