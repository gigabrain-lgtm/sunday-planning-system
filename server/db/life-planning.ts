import { getDb } from "../db";
import {
  habitCategories,
  lifeMissions,
  habits,
  habitCompletions,
  quests,
  dailyReflections,
  gamificationProfiles,
  xpTransactions,
  lifeVisualizations,
  type InsertHabit,
  type InsertHabitCompletion,
  type InsertQuest,
  type InsertDailyReflection,
  type InsertLifeMission,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

/**
 * Life Planning Database Functions
 */

// ==================== Habit Categories ====================

export async function getHabitCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(habitCategories).orderBy(habitCategories.sortOrder);
}

// ==================== Life Missions ====================

export async function getLifeMission(userId: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(lifeMissions)
    .where(and(eq(lifeMissions.userId, userId), eq(lifeMissions.year, year)))
    .limit(1);
  return results[0] || null;
}

export async function upsertLifeMission(data: InsertLifeMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getLifeMission(data.userId, data.year);
  
  if (existing) {
    await db
      .update(lifeMissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lifeMissions.id, existing.id));
    return { ...existing, ...data };
  } else {
    const result = await db.insert(lifeMissions).values(data).returning();
    return result[0];
  }
}

// ==================== Habits ====================

export async function getHabits(userId: number, activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(habits.userId, userId)];
  if (activeOnly) {
    conditions.push(eq(habits.isActive, true));
  }
  
  return await db
    .select()
    .from(habits)
    .where(and(...conditions))
    .orderBy(habits.categoryId, habits.name);
}

export async function getHabitById(habitId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1);
  return results[0] || null;
}

export async function createHabit(data: InsertHabit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(habits).values(data).returning();
  return result[0];
}

export async function updateHabit(habitId: number, data: Partial<InsertHabit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(habits).set(data).where(eq(habits.id, habitId));
}

export async function deleteHabit(habitId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(habits).set({ isActive: false }).where(eq(habits.id, habitId));
}

// ==================== Habit Completions ====================

export async function getHabitCompletions(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completedDate, startDate),
        lte(habitCompletions.completedDate, endDate)
      )
    )
    .orderBy(habitCompletions.completedDate);
}

export async function getHabitCompletion(habitId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const dateStr = date.toISOString().split('T')[0];
  const results = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        sql`DATE(${habitCompletions.completedDate}) = ${dateStr}`
      )
    )
    .limit(1);
  return results[0] || null;
}

export async function upsertHabitCompletion(data: InsertHabitCompletion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getHabitCompletion(data.habitId, data.completedDate);
  
  if (existing) {
    await db
      .update(habitCompletions)
      .set(data)
      .where(eq(habitCompletions.id, existing.id));
    return { ...existing, ...data };
  } else {
    const result = await db.insert(habitCompletions).values(data).returning();
    return result[0];
  }
}

// ==================== Quests ====================

export async function getQuests(userId: number, questType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(quests.userId, userId)];
  if (questType) {
    conditions.push(eq(quests.questType, questType));
  }
  
  return await db
    .select()
    .from(quests)
    .where(and(...conditions))
    .orderBy(desc(quests.startDate));
}

export async function getActiveQuests(userId: number, currentDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(quests)
    .where(
      and(
        eq(quests.userId, userId),
        eq(quests.completed, false),
        lte(quests.startDate, currentDate),
        gte(quests.endDate, currentDate)
      )
    )
    .orderBy(quests.endDate);
}

export async function createQuest(data: InsertQuest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(quests).values(data).returning();
  return result[0];
}

export async function completeQuest(questId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(quests)
    .set({ completed: true, completedAt: new Date() })
    .where(eq(quests.id, questId));
}

// ==================== Daily Reflections ====================

export async function getDailyReflection(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const dateStr = date.toISOString().split('T')[0];
  const results = await db
    .select()
    .from(dailyReflections)
    .where(
      and(
        eq(dailyReflections.userId, userId),
        sql`DATE(${dailyReflections.reflectionDate}) = ${dateStr}`
      )
    )
    .limit(1);
  return results[0] || null;
}

export async function getDailyReflections(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(dailyReflections)
    .where(
      and(
        eq(dailyReflections.userId, userId),
        gte(dailyReflections.reflectionDate, startDate),
        lte(dailyReflections.reflectionDate, endDate)
      )
    )
    .orderBy(desc(dailyReflections.reflectionDate));
}

export async function upsertDailyReflection(data: InsertDailyReflection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getDailyReflection(data.userId, data.reflectionDate);
  
  if (existing) {
    await db
      .update(dailyReflections)
      .set(data)
      .where(eq(dailyReflections.id, existing.id));
    return { ...existing, ...data };
  } else {
    const result = await db.insert(dailyReflections).values(data).returning();
    return result[0];
  }
}

// ==================== Gamification ====================

export async function getGamificationProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(gamificationProfiles)
    .where(eq(gamificationProfiles.userId, userId))
    .limit(1);
  
  if (results[0]) {
    return results[0];
  }
  
  // Create default profile if doesn't exist
  const newProfile = await db
    .insert(gamificationProfiles)
    .values({ userId })
    .returning();
  return newProfile[0];
}

export async function addXP(userId: number, amount: number, reason: string, sourceType: string, sourceId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const profile = await getGamificationProfile(userId);
  
  // Calculate new XP and level
  let newXp = profile.currentXp + amount;
  let newLevel = profile.level;
  let xpToNext = profile.xpToNextLevel;
  
  // Level up logic
  while (newXp >= xpToNext) {
    newXp -= xpToNext;
    newLevel++;
    xpToNext = 100 + (newLevel * 50); // Each level requires more XP
  }
  
  // Update profile
  await db
    .update(gamificationProfiles)
    .set({
      currentXp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
      updatedAt: new Date(),
    })
    .where(eq(gamificationProfiles.userId, userId));
  
  // Record transaction
  await db.insert(xpTransactions).values({
    userId,
    amount,
    reason,
    sourceType,
    sourceId,
  });
  
  return { newLevel, newXp, xpToNext, leveledUp: newLevel > profile.level };
}

export async function updateStreak(userId: number, currentStreak: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const profile = await getGamificationProfile(userId);
  const longestStreak = Math.max(profile.longestStreak, currentStreak);
  
  await db
    .update(gamificationProfiles)
    .set({
      currentStreak,
      longestStreak,
      updatedAt: new Date(),
    })
    .where(eq(gamificationProfiles.userId, userId));
}

export async function incrementHabitsCompleted(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(gamificationProfiles)
    .set({
      totalHabitsCompleted: sql`${gamificationProfiles.totalHabitsCompleted} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(gamificationProfiles.userId, userId));
}

export async function getXPHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(limit);
}

// ==================== Visualizations ====================

export async function saveLifeVisualization(data: Omit<typeof lifeVisualizations.$inferInsert, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(lifeVisualizations).values(data).returning();
  return result[0];
}

export async function getLifeVisualizations(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(lifeVisualizations)
    .where(eq(lifeVisualizations.userId, userId))
    .orderBy(desc(lifeVisualizations.createdAt))
    .limit(limit);
}
