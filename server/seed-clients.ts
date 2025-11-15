// Seed sample client data for testing
import { getDb } from "./db";
import { clickupClients } from "../drizzle/schema";

async function seedClients() {
  console.log('[Seed] Starting client data seeding...');
  
  const sampleClients = [
    {
      id: 'client_001',
      name: 'Acme Corp',
      brand: 'Acme Brand',
      company: 'Acme Corporation',
      mrpSeller: 'Acme Seller',
      status: 'active' as const,
      defcon: 1,
      notes: 'High priority client',
    },
    {
      id: 'client_002',
      name: 'TechGear Inc',
      brand: 'TechGear',
      company: 'TechGear Incorporated',
      mrpSeller: 'TechGear MRP',
      status: 'active' as const,
      defcon: 2,
      notes: 'Medium priority',
    },
    {
      id: 'client_003',
      name: 'HomeGoods LLC',
      brand: 'HomeGoods',
      company: 'HomeGoods Limited',
      mrpSeller: 'HomeGoods Seller',
      status: 'active' as const,
      defcon: 3,
      notes: 'Standard client',
    },
    {
      id: 'client_004',
      name: 'FitnessPro',
      brand: 'FitnessPro Brand',
      company: 'FitnessPro Company',
      mrpSeller: 'FitnessPro MRP',
      status: 'paused' as const,
      defcon: 2,
      notes: 'Temporarily paused',
    },
    {
      id: 'client_005',
      name: 'BeautyBox',
      brand: 'BeautyBox',
      company: 'BeautyBox International',
      mrpSeller: 'BeautyBox Seller',
      status: 'active' as const,
      defcon: 1,
      notes: 'VIP client',
    },
  ];

  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }
    
    for (const client of sampleClients) {
      await db.insert(clickupClients)
        .values(client)
        .onConflictDoUpdate({
          target: clickupClients.id,
          set: {
            name: client.name,
            brand: client.brand,
            company: client.company,
            mrpSeller: client.mrpSeller,
            status: client.status,
            defcon: client.defcon,
            notes: client.notes,
            updatedAt: new Date(),
          },
        });
      console.log(`[Seed] Inserted/updated client: ${client.name}`);
    }
    
    console.log('[Seed] Client data seeding completed successfully');
    console.log(`[Seed] Total clients: ${sampleClients.length}`);
  } catch (error) {
    console.error('[Seed] Error seeding client data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedClients()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedClients };
