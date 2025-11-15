// Seed sample client data for testing
import { getDb } from "./db";
import { clickupClients } from "../drizzle/schema";

async function seedClients() {
  console.log('[Seed] Starting client data seeding...');
  
  const sampleClients = [
    {
      clickupTaskId: 'client_001',
      clickupUrl: 'https://app.clickup.com/t/client_001',
      clientName: 'Acme Corp',
      brandName: 'Acme Brand',
      company: 'Acme Corporation',
      status: 'active',
      defcon: 1,
      amOwner: 'Hunter',
      ppcOwner: 'VJ',
      creativeOwner: 'Anthony',
      podOwner: 'Steven',
      totalAsinsFam: '50',
      totalAsinsPpc: '45',
    },
    {
      clickupTaskId: 'client_002',
      clickupUrl: 'https://app.clickup.com/t/client_002',
      clientName: 'TechGear Inc',
      brandName: 'TechGear',
      company: 'TechGear Incorporated',
      status: 'active',
      defcon: 2,
      amOwner: 'Hunter',
      ppcOwner: 'VJ',
      creativeOwner: 'Anthony',
      podOwner: 'Steven',
      totalAsinsFam: '30',
      totalAsinsPpc: '28',
    },
    {
      clickupTaskId: 'client_003',
      clickupUrl: 'https://app.clickup.com/t/client_003',
      clientName: 'HomeGoods LLC',
      brandName: 'HomeGoods',
      company: 'HomeGoods Limited',
      status: 'active',
      defcon: 3,
      amOwner: 'Hunter',
      ppcOwner: 'Umer',
      creativeOwner: 'Anthony',
      podOwner: 'Steven',
      totalAsinsFam: '20',
      totalAsinsPpc: '18',
    },
    {
      clickupTaskId: 'client_004',
      clickupUrl: 'https://app.clickup.com/t/client_004',
      clientName: 'FitnessPro',
      brandName: 'FitnessPro Brand',
      company: 'FitnessPro Company',
      status: 'paused',
      defcon: 2,
      amOwner: 'Hunter',
      ppcOwner: 'VJ',
      creativeOwner: 'Anthony',
      podOwner: 'Steven',
      totalAsinsFam: '15',
      totalAsinsPpc: '12',
    },
    {
      clickupTaskId: 'client_005',
      clickupUrl: 'https://app.clickup.com/t/client_005',
      clientName: 'BeautyBox',
      brandName: 'BeautyBox',
      company: 'BeautyBox International',
      status: 'active',
      defcon: 1,
      amOwner: 'Hunter',
      ppcOwner: 'VJ',
      creativeOwner: 'Anthony',
      podOwner: 'Steven',
      totalAsinsFam: '40',
      totalAsinsPpc: '38',
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
          target: clickupClients.clickupTaskId,
          set: {
            clientName: client.clientName,
            brandName: client.brandName,
            company: client.company,
            status: client.status,
            defcon: client.defcon,
            amOwner: client.amOwner,
            ppcOwner: client.ppcOwner,
            creativeOwner: client.creativeOwner,
            podOwner: client.podOwner,
            totalAsinsFam: client.totalAsinsFam,
            totalAsinsPpc: client.totalAsinsPpc,
            updatedAt: new Date(),
          },
        });
      console.log(`[Seed] Inserted/updated client: ${client.clientName}`);
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
