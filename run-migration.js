// Run this script to create the agencies table manually
// Usage: node run-migration.js

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('\nPlease set it first:');
  console.log('export DATABASE_URL="your-database-connection-string"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running migration to create agencies table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "agencies" (
        "id" varchar(255) PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "slackChannelId" varchar(255),
        "department" varchar(255) NOT NULL,
        "logo" varchar(255),
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ Successfully created agencies table!');
    
    // Verify table exists
    const verifySQL = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'agencies';
    `;
    
    const result = await client.query(verifySQL);
    if (result.rows.length > 0) {
      console.log('✅ Verified: agencies table exists');
    } else {
      console.log('⚠️  Warning: Could not verify table creation');
    }
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n🎉 Migration complete! You can now update agencies.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
