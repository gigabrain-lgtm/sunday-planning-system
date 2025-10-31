import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  microsoftAccessToken: text("microsoftAccessToken"),
  microsoftRefreshToken: text("microsoftRefreshToken"),
  microsoftTokenExpiry: timestamp("microsoftTokenExpiry"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Weekly planning sessions
 */
export const weeklyPlannings = pgTable("weekly_plannings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  weekOf: timestamp("weekOf").notNull(),
  
  // Business Planning (11 categories)
  companyWide: text("companyWide"),
  marketing: text("marketing"),
  sales: text("sales"),
  churn: text("churn"),
  creatives: text("creatives"),
  dsp: text("dsp"),
  finance: text("finance"),
  recruiting: text("recruiting"),
  systems: text("systems"),
  fulfilment: text("fulfilment"),
  pendingRoadmap: text("pendingRoadmap"),
  
  // Personal Planning
  eaTasks: text("eaTasks"),
  paTasks: text("paTasks"),
  personalTasks: text("personalTasks"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WeeklyPlanning = typeof weeklyPlannings.$inferSelect;
export type InsertWeeklyPlanning = typeof weeklyPlannings.$inferInsert;

/**
 * Manifestation tracker data (12 pillars)
 */
export const manifestations = pgTable("manifestations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  weekOf: timestamp("weekOf").notNull(),
  
  // Ratings (0-10)
  spiritualRating: integer("spiritualRating"),
  socialRating: integer("socialRating"),
  relationshipRating: integer("relationshipRating"),
  statusRating: integer("statusRating"),
  teamRating: integer("teamRating"),
  businessRating: integer("businessRating"),
  travelRating: integer("travelRating"),
  environmentRating: integer("environmentRating"),
  familyRating: integer("familyRating"),
  skillsRating: integer("skillsRating"),
  healthRating: integer("healthRating"),
  affirmationsRating: integer("affirmationsRating"),
  
  // Reflections (stored as currentState for backward compatibility)
  spiritualCurrentState: text("spiritualCurrentState"),
  socialCurrentState: text("socialCurrentState"),
  relationshipCurrentState: text("relationshipCurrentState"),
  statusCurrentState: text("statusCurrentState"),
  teamCurrentState: text("teamCurrentState"),
  businessCurrentState: text("businessCurrentState"),
  travelCurrentState: text("travelCurrentState"),
  environmentCurrentState: text("environmentCurrentState"),
  familyCurrentState: text("familyCurrentState"),
  skillsCurrentState: text("skillsCurrentState"),
  healthCurrentState: text("healthCurrentState"),
  affirmationsCurrentState: text("affirmationsCurrentState"),
  
  // Actionables
  spiritualActionables: text("spiritualActionables"),
  socialActionables: text("socialActionables"),
  relationshipActionables: text("relationshipActionables"),
  statusActionables: text("statusActionables"),
  teamActionables: text("teamActionables"),
  businessActionables: text("businessActionables"),
  travelActionables: text("travelActionables"),
  environmentActionables: text("environmentActionables"),
  familyActionables: text("familyActionables"),
  skillsActionables: text("skillsActionables"),
  healthActionables: text("healthActionables"),
  affirmationsActionables: text("affirmationsActionables"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Manifestation = typeof manifestations.$inferSelect;
export type InsertManifestation = typeof manifestations.$inferInsert;

/**
 * Key Result to Objective mappings
 * Stores which Key Results belong to which Objectives
 */
export const keyResultObjectiveMappings = pgTable("key_result_objective_mappings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  keyResultId: varchar("keyResultId", { length: 64 }).notNull().unique(),
  objectiveId: varchar("objectiveId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type KeyResultObjectiveMapping = typeof keyResultObjectiveMappings.$inferSelect;
export type InsertKeyResultObjectiveMapping = typeof keyResultObjectiveMappings.$inferInsert;

/**
 * Visualizations - future vision statements
 * Users can write about where they want to be in the future
 * This table stores the CURRENT visualization for each user
 */
export const visualizations = pgTable("visualizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Visualization = typeof visualizations.$inferSelect;
export type InsertVisualization = typeof visualizations.$inferInsert;

/**
 * Visualization History - tracks all past versions of visualizations
 * Every time a user updates their visualization, the old version is saved here
 */
export const visualizationHistory = pgTable("visualization_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  // When this version was created (copied from the main visualizations table)
  versionDate: timestamp("versionDate").notNull(),
  // When this history record was created
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VisualizationHistory = typeof visualizationHistory.$inferSelect;
export type InsertVisualizationHistory = typeof visualizationHistory.$inferInsert;

/**
 * Sleep Sessions - Eight Sleep data
 * Stores sleep session data from Eight Sleep API
 */
export const sleepSessions = pgTable("sleep_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  
  // Session identification
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  sessionDate: timestamp("sessionDate").notNull(),
  
  // Sleep metrics
  sleepScore: integer("sleepScore"), // 0-100
  sleepDuration: integer("sleepDuration"), // minutes
  
  // Sleep stages (minutes)
  lightSleepMinutes: integer("lightSleepMinutes"),
  deepSleepMinutes: integer("deepSleepMinutes"),
  remSleepMinutes: integer("remSleepMinutes"),
  awakeMinutes: integer("awakeMinutes"),
  
  // Session timing
  bedtimeStart: timestamp("bedtimeStart"),
  bedtimeEnd: timestamp("bedtimeEnd"),
  
  // Sleep fitness scores
  sleepFitnessScore: integer("sleepFitnessScore"),
  
  // Raw data for future analysis
  rawData: text("rawData"), // JSON string of full API response
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SleepSession = typeof sleepSessions.$inferSelect;
export type InsertSleepSession = typeof sleepSessions.$inferInsert;

/**
 * Life Planning System - Habit Tracking and Gamification
 */

// Habit Categories
export const habitCategories = pgTable("habit_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  sortOrder: integer("sortOrder").notNull(),
});

export type HabitCategory = typeof habitCategories.$inferSelect;
export type InsertHabitCategory = typeof habitCategories.$inferInsert;

// Life Missions
export const lifeMissions = pgTable("life_missions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  missionStatements: text("missionStatements").notNull(), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LifeMission = typeof lifeMissions.$inferSelect;
export type InsertLifeMission = typeof lifeMissions.$inferInsert;

// Habits
export const habits = pgTable("habits", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  categoryId: integer("categoryId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  targetValue: integer("targetValue"),
  unit: text("unit"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

// Habit Completions
export const habitCompletions = pgTable("habit_completions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  habitId: integer("habitId").notNull(),
  userId: integer("userId").notNull(),
  completedDate: timestamp("completedDate").notNull(),
  completed: boolean("completed").notNull().default(false),
  value: integer("value"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = typeof habitCompletions.$inferInsert;

// Quests
export const quests = pgTable("quests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  questType: text("questType").notNull(), // 'weekly', 'monthly', 'specific_monthly'
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = typeof quests.$inferInsert;

// Daily Reflections
export const dailyReflections = pgTable("daily_reflections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  reflectionDate: timestamp("reflectionDate").notNull(),
  dailyIntention: text("dailyIntention"),
  freeJournal: text("freeJournal"),
  oneThingGrateful: text("oneThingGrateful"),
  oneThingLearned: text("oneThingLearned"),
  sleepTime: text("sleepTime"),
  wakeTime: text("wakeTime"),
  unscheduledScreenTime: integer("unscheduledScreenTime"),
  recoveryFocus: text("recoveryFocus"),
  calendarAudited: boolean("calendarAudited"),
  dietScore: integer("dietScore"),
  big3OrSmallFood: text("big3OrSmallFood"),
  promisesHonored: boolean("promisesHonored"),
  tmrwsIntention: text("tmrwsIntention"),
  clothesLaidOut: boolean("clothesLaidOut"),
  phoneOnCharge: boolean("phoneOnCharge"),
  biggestVice: text("biggestVice"),
  personalConstraint: text("personalConstraint"),
  onTrackProjections: boolean("onTrackProjections"),
  newCash: text("newCash"), // Storing as text to avoid decimal precision issues
  cashInBank: text("cashInBank"),
  inputPercentage: integer("inputPercentage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyReflection = typeof dailyReflections.$inferSelect;
export type InsertDailyReflection = typeof dailyReflections.$inferInsert;

// Gamification Profile
export const gamificationProfiles = pgTable("gamification_profiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().unique(),
  level: integer("level").notNull().default(1),
  currentXp: integer("currentXp").notNull().default(0),
  xpToNextLevel: integer("xpToNextLevel").notNull().default(100),
  impulsePoints: integer("impulsePoints").notNull().default(0),
  totalHabitsCompleted: integer("totalHabitsCompleted").notNull().default(0),
  currentStreak: integer("currentStreak").notNull().default(0),
  longestStreak: integer("longestStreak").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GamificationProfile = typeof gamificationProfiles.$inferSelect;
export type InsertGamificationProfile = typeof gamificationProfiles.$inferInsert;

// XP Transactions
export const xpTransactions = pgTable("xp_transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  sourceType: text("sourceType").notNull(), // 'habit_completion', 'quest_completion', 'streak_bonus', 'manual'
  sourceId: integer("sourceId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = typeof xpTransactions.$inferInsert;

// Life Visualizations
export const lifeVisualizations = pgTable("life_visualizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  visualizationType: text("visualizationType").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  data: text("data"), // JSON string
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LifeVisualization = typeof lifeVisualizations.$inferSelect;
export type InsertLifeVisualization = typeof lifeVisualizations.$inferInsert;
