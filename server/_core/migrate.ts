import pkg from 'pg';
const { Pool } = pkg;

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[Migration] No DATABASE_URL found, skipping migrations");
    return;
  }

  console.log("[Migration] Running database migrations...");
  console.log("[Migration] NODE_ENV:", process.env.NODE_ENV);
  
  // Temporarily disable TLS certificate validation for this connection
  const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create role enum if it doesn't exist
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "openId" varchar(64) NOT NULL UNIQUE,
        name text,
        email varchar(320),
        "loginMethod" varchar(64),
        role role DEFAULT 'user' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        "lastSignedIn" timestamp DEFAULT now() NOT NULL,
        "microsoftAccessToken" text,
        "microsoftRefreshToken" text,
        "microsoftTokenExpiry" timestamp
      );
    `);

    // Create weekly_plannings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_plannings (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" integer NOT NULL,
        "weekOf" timestamp NOT NULL,
        "companyWide" text,
        marketing text,
        sales text,
        churn text,
        creatives text,
        dsp text,
        finance text,
        recruiting text,
        systems text,
        fulfilment text,
        "pendingRoadmap" text,
        "eaTasks" text,
        "paTasks" text,
        "personalTasks" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create manifestations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manifestations (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" integer NOT NULL,
        "weekOf" timestamp NOT NULL,
        "spiritualRating" integer,
        "socialRating" integer,
        "relationshipRating" integer,
        "statusRating" integer,
        "teamRating" integer,
        "businessRating" integer,
        "travelRating" integer,
        "environmentRating" integer,
        "familyRating" integer,
        "skillsRating" integer,
        "healthRating" integer,
        "affirmationsRating" integer,
        "spiritualCurrentState" text,
        "socialCurrentState" text,
        "relationshipCurrentState" text,
        "statusCurrentState" text,
        "teamCurrentState" text,
        "businessCurrentState" text,
        "travelCurrentState" text,
        "environmentCurrentState" text,
        "familyCurrentState" text,
        "skillsCurrentState" text,
        "healthCurrentState" text,
        "affirmationsCurrentState" text,
        "spiritualActionables" text,
        "socialActionables" text,
        "relationshipActionables" text,
        "statusActionables" text,
        "teamActionables" text,
        "businessActionables" text,
        "travelActionables" text,
        "environmentActionables" text,
        "familyActionables" text,
        "skillsActionables" text,
        "healthActionables" text,
        "affirmationsActionables" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create key_result_objective_mappings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS key_result_objective_mappings (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "keyResultId" varchar(64) NOT NULL UNIQUE,
        "objectiveId" varchar(64) NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create visualizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visualizations (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" integer NOT NULL,
        content text NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create visualization_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visualization_history (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" integer NOT NULL,
        content text NOT NULL,
        "versionDate" timestamp NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create clickup_clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clickup_clients (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "clickupTaskId" varchar(64) NOT NULL UNIQUE,
        "clickupUrl" text,
        "clientName" text NOT NULL,
        "brandName" text,
        company text,
        status varchar(64),
        defcon integer DEFAULT 3 NOT NULL,
        "amOwner" text,
        "ppcOwner" text,
        "creativeOwner" text,
        "podOwner" text,
        "totalAsinsFam" text,
        "totalAsinsPpc" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create sleep_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sleep_sessions (
        id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "userId" integer NOT NULL,
        "sessionId" varchar(128) NOT NULL UNIQUE,
        "sessionDate" timestamp NOT NULL,
        "sleepScore" integer,
        "sleepDuration" integer,
        "lightSleepMinutes" integer,
        "deepSleepMinutes" integer,
        "remSleepMinutes" integer,
        "awakeMinutes" integer,
        "bedtimeStart" timestamp,
        "bedtimeEnd" timestamp,
        "sleepFitnessScore" integer,
        "rawData" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("[Migration] ✅ Database migrations completed successfully");
  } catch (error) {
    console.error("[Migration] ❌ Error running migrations:", error);
    throw error;
  } finally {
    await pool.end();
    // Restore original TLS setting
    if (originalRejectUnauthorized !== undefined) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
    } else {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }
  }
}
