import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import { InsertUser, users, weeklyPlannings, manifestations, InsertWeeklyPlanning, InsertManifestation, keyResultObjectiveMappings, InsertKeyResultObjectiveMapping } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: typeof Pool.prototype | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Weekly Planning queries
export async function saveWeeklyPlanning(data: InsertWeeklyPlanning) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(weeklyPlannings).values(data);
  return result;
}

export async function getLatestWeeklyPlanning(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(weeklyPlannings)
    .where(eq(weeklyPlannings.userId, userId))
    .orderBy(desc(weeklyPlannings.weekOf))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

// Manifestation queries
export async function saveManifestation(data: InsertManifestation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(manifestations).values(data);
  return result;
}

export async function getLatestManifestation(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(manifestations)
    .where(eq(manifestations.userId, userId))
    .orderBy(desc(manifestations.weekOf))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

// Key Result-Objective Mapping queries
export async function saveKeyResultObjectiveMapping(keyResultId: string, objectiveId: string) {
  console.log(`[DB] saveKeyResultObjectiveMapping called with keyResultId: ${keyResultId}, objectiveId: ${objectiveId}`);
  const db = await getDb();
  if (!db) {
    console.error("[DB] Database not available!");
    throw new Error("Database not available");
  }
  
  const data: InsertKeyResultObjectiveMapping = {
    keyResultId,
    objectiveId,
  };
  
  console.log(`[DB] Inserting data:`, data);
  // Use ON CONFLICT DO UPDATE to handle upserts
  const result = await db.insert(keyResultObjectiveMappings).values(data).onConflictDoUpdate({
    target: keyResultObjectiveMappings.keyResultId,
    set: { objectiveId, updatedAt: new Date() },
  });
  console.log(`[DB] Insert result:`, result);
  return result;
}

export async function getKeyResultObjectiveMappings() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(keyResultObjectiveMappings);
  return result;
}

export async function getObjectiveIdForKeyResult(keyResultId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(keyResultObjectiveMappings)
    .where(eq(keyResultObjectiveMappings.keyResultId, keyResultId))
    .limit(1);
    
  return result.length > 0 ? result[0].objectiveId : null;
}

