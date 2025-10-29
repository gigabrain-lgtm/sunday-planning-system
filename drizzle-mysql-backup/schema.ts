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
