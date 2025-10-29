import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Weekly planning sessions
 */
export const weeklyPlannings = mysqlTable("weekly_plannings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekOf: datetime("weekOf").notNull(),
  
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyPlanning = typeof weeklyPlannings.$inferSelect;
export type InsertWeeklyPlanning = typeof weeklyPlannings.$inferInsert;

/**
 * Manifestation tracker data (12 pillars)
 */
export const manifestations = mysqlTable("manifestations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekOf: datetime("weekOf").notNull(),
  
  // Ratings (0-10)
  spiritualRating: int("spiritualRating"),
  socialRating: int("socialRating"),
  relationshipRating: int("relationshipRating"),
  statusRating: int("statusRating"),
  teamRating: int("teamRating"),
  businessRating: int("businessRating"),
  travelRating: int("travelRating"),
  environmentRating: int("environmentRating"),
  familyRating: int("familyRating"),
  skillsRating: int("skillsRating"),
  healthRating: int("healthRating"),
  affirmationsRating: int("affirmationsRating"),
  
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manifestation = typeof manifestations.$inferSelect;
export type InsertManifestation = typeof manifestations.$inferInsert;

/**
 * Key Result to Objective mappings
 * Stores which Key Results belong to which Objectives
 */
export const keyResultObjectiveMappings = mysqlTable("key_result_objective_mappings", {
  id: int("id").autoincrement().primaryKey(),
  keyResultId: varchar("keyResultId", { length: 64 }).notNull().unique(),
  objectiveId: varchar("objectiveId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KeyResultObjectiveMapping = typeof keyResultObjectiveMappings.$inferSelect;
export type InsertKeyResultObjectiveMapping = typeof keyResultObjectiveMappings.$inferInsert;

