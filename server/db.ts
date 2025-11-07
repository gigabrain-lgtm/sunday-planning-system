import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import { InsertUser, users, weeklyPlannings, manifestations, InsertWeeklyPlanning, InsertManifestation, keyResultObjectiveMappings, InsertKeyResultObjectiveMapping, visualizations, InsertVisualization, visualizationHistory, InsertVisualizationHistory, sleepSessions, agencies, InsertAgency, Agency } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: typeof Pool.prototype | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

// ============================================================================
// Visualization Functions
// ============================================================================

export async function saveVisualization(userId: number, content: string) {
  const db = await getDb();
  if (!db) {
    console.error("[DB] Database not available!");
    throw new Error("Database not available");
  }
  
  // Check if user already has a visualization
  const existing = await db
    .select()
    .from(visualizations)
    .where(eq(visualizations.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    // Save the old version to history before updating
    await db.insert(visualizationHistory).values({
      userId,
      content: existing[0].content,
      versionDate: existing[0].updatedAt,
    });
    
    // Update existing visualization
    await db
      .update(visualizations)
      .set({ content, updatedAt: new Date() })
      .where(eq(visualizations.userId, userId));
  } else {
    // Insert new visualization
    await db.insert(visualizations).values({
      userId,
      content,
    });
  }
}

export async function getVisualization(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(visualizations)
    .where(eq(visualizations.userId, userId))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

export async function getVisualizationHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(visualizationHistory)
    .where(eq(visualizationHistory.userId, userId))
    .orderBy(desc(visualizationHistory.versionDate));
    
  return result;
}

// ============================================================================
// Microsoft OAuth Functions
// ============================================================================

export async function saveMicrosoftTokens(
  userId: number,
  accessToken: string,
  refreshToken: string,
  tokenExpiry: Date
) {
  const db = await getDb();
  if (!db) {
    console.error("[DB] Database not available!");
    throw new Error("Database not available");
  }
  
  await db
    .update(users)
    .set({
      microsoftAccessToken: accessToken,
      microsoftRefreshToken: refreshToken,
      microsoftTokenExpiry: tokenExpiry,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// Scorecard Functions
// ============================================================================

export async function saveScorecardData(userId: number, data: any) {
  const db = await getDb();
  if (!db) {
    console.error("[DB] Database not available!");
    throw new Error("Database not available");
  }
  
  // Store scorecard data as JSON in a new table
  // For now, we'll store it in the weekly_plannings table as a workaround
  // TODO: Create dedicated scorecard_data table
  
  const weekOf = new Date();
  weekOf.setHours(0, 0, 0, 0);
  
  // Check if there's already a planning for this week
  const existing = await db
    .select()
    .from(weeklyPlannings)
    .where(eq(weeklyPlannings.userId, userId))
    .where(eq(weeklyPlannings.weekOf, weekOf))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db
      .update(weeklyPlannings)
      .set({
        // Store scorecard data in a dedicated field (we'll add this to schema)
        updatedAt: new Date(),
      })
      .where(eq(weeklyPlannings.id, existing[0].id));
  }
  
  // For now, just return success
  // We'll implement proper storage after testing the Excel parsing
  return { success: true };
}

export async function getLatestScorecardData(userId: number) {
  // TODO: Implement after creating scorecard_data table
  return null;
}

export async function getScorecardHistory(userId: number) {
  // TODO: Implement after creating scorecard_data table
  return [];
}

// ============================================================================
// Sleep Sessions Functions
// ============================================================================

export async function getSleepSessions(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await db
    .select()
    .from(sleepSessions)
    .where(eq(sleepSessions.userId, userId))
    .orderBy(desc(sleepSessions.sessionDate));
    
  return result;
}

export async function getWeeklySleepSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get last 7 days of sleep data
  const sessions = await getSleepSessions(userId, 7);
  
  if (sessions.length === 0) {
    return null;
  }
  
  // Calculate averages
  const totalScore = sessions.reduce((sum, s) => sum + (s.sleepScore || 0), 0);
  const totalDuration = sessions.reduce((sum, s) => sum + (s.sleepDuration || 0), 0);
  const totalLight = sessions.reduce((sum, s) => sum + (s.lightSleepMinutes || 0), 0);
  const totalDeep = sessions.reduce((sum, s) => sum + (s.deepSleepMinutes || 0), 0);
  const totalRem = sessions.reduce((sum, s) => sum + (s.remSleepMinutes || 0), 0);
  const totalAwake = sessions.reduce((sum, s) => sum + (s.awakeMinutes || 0), 0);
  
  const count = sessions.length;
  
  // Find best and worst nights
  const sortedByScore = [...sessions].sort((a, b) => (b.sleepScore || 0) - (a.sleepScore || 0));
  const bestNight = sortedByScore[0];
  const worstNight = sortedByScore[sortedByScore.length - 1];
  
  return {
    averageScore: Math.round(totalScore / count),
    averageDuration: Math.round(totalDuration / count),
    averageLight: Math.round(totalLight / count),
    averageDeep: Math.round(totalDeep / count),
    averageRem: Math.round(totalRem / count),
    averageAwake: Math.round(totalAwake / count),
    totalNights: count,
    bestNight: {
      date: bestNight.sessionDate,
      score: bestNight.sleepScore,
      duration: bestNight.sleepDuration,
    },
    worstNight: {
      date: worstNight.sessionDate,
      score: worstNight.sleepScore,
      duration: worstNight.sleepDuration,
    },
    sessions: sessions,
  };
}

/**
 * Agency Management Functions
 */

export async function createAgency(agency: InsertAgency): Promise<Agency> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [newAgency] = await db.insert(agencies).values(agency).returning();
  return newAgency;
}

export async function getAllAgencies(): Promise<Agency[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(agencies);
}

export async function getAgencyById(id: number): Promise<Agency | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const [agency] = await db.select().from(agencies).where(eq(agencies.id, id));
  return agency;
}

export async function getAgencyByName(name: string): Promise<Agency | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const [agency] = await db.select().from(agencies).where(eq(agencies.name, name));
  return agency;
}

export async function updateAgency(id: number, updates: Partial<InsertAgency>): Promise<Agency> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [updatedAgency] = await db
    .update(agencies)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(agencies.id, id))
    .returning();
  
  return updatedAgency;
}

export async function deleteAgency(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(agencies).where(eq(agencies.id, id));
}
