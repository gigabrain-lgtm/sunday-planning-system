// Run database migrations from SQL files
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('[Migration] Starting database migrations...');
  
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }
    
    // Get the drizzle folder path
    const drizzlePath = path.join(__dirname, '..', 'drizzle');
    
    // Check if migrations folder exists
    if (!fs.existsSync(drizzlePath)) {
      console.log('[Migration] No migrations folder found, skipping');
      return;
    }
    
    // Get all SQL files
    const files = fs.readdirSync(drizzlePath)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    if (files.length === 0) {
      console.log('[Migration] No SQL migration files found');
      return;
    }
    
    console.log(`[Migration] Found ${files.length} migration files`);
    
    // Run each migration
    for (const file of files) {
      const filePath = path.join(drizzlePath, file);
      const migrationSQL = fs.readFileSync(filePath, 'utf-8');
      
      try {
        await db.execute(sql.raw(migrationSQL));
        console.log(`[Migration] ✓ Applied: ${file}`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log(`[Migration] ⊘ Skipped (already exists): ${file}`);
        } else {
          console.error(`[Migration] ✗ Failed: ${file}`, error.message);
          // Don't throw - continue with other migrations
        }
      }
    }
    
    console.log('[Migration] Database migrations completed');
  } catch (error) {
    console.error('[Migration] Error running migrations:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('[Migration] Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Fatal error:', error);
      process.exit(1);
    });
}

export { runMigrations };
