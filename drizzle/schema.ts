import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

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

/**
 * Unified Standup System
 * Integrates daily standups, weekly check-ins, and blocker tracking
 */

/**
 * Daily Standup Submissions
 * Tracks which tasks users commit to each day
 */
export const dailyStandups = pgTable("daily_standups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  standupDate: timestamp("standupDate").notNull(),
  taskIds: text("taskIds").array().notNull(), // Array of ClickUp task IDs
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyStandup = typeof dailyStandups.$inferSelect;
export type InsertDailyStandup = typeof dailyStandups.$inferInsert;

/**
 * Task Blockers/Bottlenecks
 * Tracks blockers reported during standups or work sessions
 */
export const taskBlockers = pgTable("task_blockers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  taskId: varchar("taskId", { length: 255 }).notNull(),
  taskName: text("taskName").notNull(),
  userId: integer("userId").notNull(),
  blockerType: varchar("blockerType", { length: 50 }),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("open").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: integer("resolvedBy"),
  resolutionNotes: text("resolutionNotes"),
});

export type TaskBlocker = typeof taskBlockers.$inferSelect;
export type InsertTaskBlocker = typeof taskBlockers.$inferInsert;

/**
 * Weekly Submissions (Check-in/Checkout)
 * Tracks weekly check-ins (Monday) and checkouts (Friday)
 */
export const weeklySubmissions = pgTable("weekly_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  submissionType: varchar("submissionType", { length: 20 }).notNull(), // 'checkin' or 'checkout'
  weekNumber: integer("weekNumber").notNull(),
  year: integer("year").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  slackMessageTs: text("slackMessageTs"),
  totalTasks: integer("totalTasks").default(0),
  completedTasks: integer("completedTasks").default(0),
  inProgressTasks: integer("inProgressTasks").default(0),
  newTasks: integer("newTasks").default(0),
  flaggedTasks: integer("flaggedTasks").default(0),
  taskData: text("taskData"), // JSON string
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklySubmission = typeof weeklySubmissions.$inferSelect;
export type InsertWeeklySubmission = typeof weeklySubmissions.$inferInsert;

/**
 * Reminder Log
 * Prevents duplicate reminder sends
 */
export const reminderLog = pgTable("reminder_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reminderType: varchar("reminderType", { length: 50 }).notNull(),
  weekNumber: integer("weekNumber").notNull(),
  year: integer("year").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  recipientCount: integer("recipientCount").default(0),
});

export type ReminderLog = typeof reminderLog.$inferSelect;
export type InsertReminderLog = typeof reminderLog.$inferInsert;

/**
 * Standup Stats
 * Weekly analytics on standup completion
 */
export const standupStats = pgTable("standup_stats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  weekNumber: integer("weekNumber").notNull(),
  year: integer("year").notNull(),
  standupsCompleted: integer("standupsCompleted").default(0),
  standupsExpected: integer("standupsExpected").default(5),
  completionRate: varchar("completionRate", { length: 10 }),
  avgTasksPerStandup: varchar("avgTasksPerStandup", { length: 10 }),
  totalBlockersReported: integer("totalBlockersReported").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StandupStats = typeof standupStats.$inferSelect;
export type InsertStandupStats = typeof standupStats.$inferInsert;

/**
 * Agency overrides table
 * Stores edits to agencies that override the static orgChart.ts data
 */
export const agencies = pgTable("agencies", {
  id: varchar("id", { length: 255 }).primaryKey(), // agency ID from orgChart.ts
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }), // custom URL slug (defaults to id if not set)
  slackChannelId: varchar("slackChannelId", { length: 255 }),
  department: varchar("department", { length: 255 }).notNull(), // department ID or 'services'
  logo: varchar("logo", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

/**
 * Payment Requests
 * Stores payment information for different payment types (credit card, ACH, wire, invoice)
 */
export const paymentTypeEnum = pgEnum("payment_type", ["credit_card", "ach", "wire", "invoice"]);
export const accountTypeEnum = pgEnum("account_type", ["checking", "savings"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected", "completed"]);

export const paymentRequests = pgTable("payment_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  userName: text("userName"),
  submitterName: text("submitterName"),
  submitterEmail: text("submitterEmail"),
  amount: text("amount"),
  paymentType: paymentTypeEnum("paymentType").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  clickupTaskId: text("clickupTaskId"),
  approvedAt: timestamp("approvedAt"),
  // Completion fields (filled by bookkeeping after payment)
  completionPaymentLink: text("completionPaymentLink"),
  completionAmount: text("completionAmount"),
  completedAt: timestamp("completedAt"),
  completedBy: text("completedBy"),
  completionClickupTaskId: text("completionClickupTaskId"),
  receiptUrl: text("receiptUrl"),
  
  // Credit Card fields
  paymentLink: text("paymentLink"),
  description: text("description"),
  dueDate: varchar("dueDate", { length: 50 }),
  serviceStartDate: varchar("serviceStartDate", { length: 50 }),
  
  // ACH fields
  achBankName: text("achBankName"),
  achBankAddress: text("achBankAddress"),
  achRoutingNumber: varchar("achRoutingNumber", { length: 50 }),
  achAccountNumber: varchar("achAccountNumber", { length: 50 }),
  achAccountType: accountTypeEnum("achAccountType"),
  achAccountHolderName: text("achAccountHolderName"),
  
  // Wire fields
  wireBankName: text("wireBankName"),
  wireBankAddress: text("wireBankAddress"),
  wireSwiftBic: varchar("wireSwiftBic", { length: 50 }),
  wireRoutingNumber: varchar("wireRoutingNumber", { length: 50 }),
  wireAccountNumber: varchar("wireAccountNumber", { length: 50 }),
  wireAccountType: accountTypeEnum("wireAccountType"),
  wireBeneficiaryName: text("wireBeneficiaryName"),
  wireBeneficiaryAddress: text("wireBeneficiaryAddress"),
  wireCountry: text("wireCountry"),
  wireIban: varchar("wireIban", { length: 100 }),
  
  // Invoice fields
  invoiceUrl: text("invoiceUrl"),
  invoiceEmail: varchar("invoiceEmail", { length: 320 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;
export type PaymentStatus = "pending" | "approved" | "rejected";


// ============================================================================
// HIRING SYSTEM TABLES
// ============================================================================

/**
 * Recruiter status enum
 */
export const recruiterStatusEnum = pgEnum("recruiter_status", ["active", "inactive"]);

/**
 * Job assignment status enum
 */
export const jobAssignmentStatusEnum = pgEnum("job_assignment_status", [
  "draft",
  "culture_index_pending",
  "workable_pending",
  "completed",
]);

/**
 * Hiring priority enum
 */
export const hiringPriorityEnum = pgEnum("hiring_priority", [
  "urgent",
  "high",
  "medium",
  "normal",
  "low",
  "inactive",
]);

/**
 * Job posting status enum
 */
export const jobPostingStatusEnum = pgEnum("job_posting_status", ["active", "paused", "closed"]);

/**
 * Candidate source enum
 */
export const candidateSourceEnum = pgEnum("candidate_source", ["linkedin_ads", "headhunting"]);

/**
 * Recruiters table
 * Stores recruiter information with auto-generated codes
 */
export const recruiters = pgTable("recruiters", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  recruiterCode: varchar("recruiterCode", { length: 50 }).notNull().unique(),
  slackChannelId: varchar("slackChannelId", { length: 255 }).notNull(),
  status: recruiterStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Recruiter = typeof recruiters.$inferSelect;
export type InsertRecruiter = typeof recruiters.$inferInsert;

/**
 * Job assignments table
 * Links recruiters to job postings with Culture Index and Workable integration
 */
export const jobAssignments = pgTable("job_assignments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  recruiterId: integer("recruiterId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  agencyName: varchar("agencyName", { length: 255 }).notNull(),
  nomenclature: text("nomenclature"),
  cultureIndexInternalLink: text("cultureIndexInternalLink"),
  cultureIndexAssessmentLink: text("cultureIndexAssessmentLink"),
  workableLink: text("workableLink"),
  workableJobId: varchar("workableJobId", { length: 50 }),
  workableShortcode: varchar("workableShortcode", { length: 50 }),
  cultureIndexQuestionAdded: integer("cultureIndexQuestionAdded").default(0).notNull(),
  status: jobAssignmentStatusEnum("status").default("draft").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type JobAssignment = typeof jobAssignments.$inferSelect;
export type InsertJobAssignment = typeof jobAssignments.$inferInsert;

/**
 * Hiring priorities table
 * Manages priority levels for different job titles
 */
export const hiringPriorities = pgTable("hiring_priorities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull().unique(),
  description: text("description"),
  priority: hiringPriorityEnum("priority").default("normal").notNull(),
  jobDescription: text("jobDescription"),
  testQuestions: text("testQuestions"),
  interviewQuestions: text("interviewQuestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type HiringPriority = typeof hiringPriorities.$inferSelect;
export type InsertHiringPriority = typeof hiringPriorities.$inferInsert;

/**
 * Roles table (for LinkedIn Ads tracking and split testing)
 */
export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roleName: varchar("roleName", { length: 255 }).notNull().unique(),
  description: text("description"),
  technicalInterviewer: varchar("technicalInterviewer", { length: 255 }),
  finalInterviewer: varchar("finalInterviewer", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

/**
 * Job postings table (LinkedIn Ads tracking)
 */
export const jobPostings = pgTable("job_postings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roleId: integer("roleId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  dailySpend: numeric("dailySpend", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  status: jobPostingStatusEnum("status").default("active").notNull(),
  totalApplicants: integer("totalApplicants").default(0).notNull(),
  linkedInJobId: varchar("linkedInJobId", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = typeof jobPostings.$inferInsert;

/**
 * Job title mappings table (for split testing)
 */
export const jobTitleMappings = pgTable("job_title_mappings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roleId: integer("roleId").notNull(),
  workableJobTitle: varchar("workableJobTitle", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobTitleMapping = typeof jobTitleMappings.$inferSelect;
export type InsertJobTitleMapping = typeof jobTitleMappings.$inferInsert;

/**
 * Invoices table (LinkedIn billing tracking)
 */
export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roleId: integer("roleId"),
  location: varchar("location", { length: 255 }),
  transactionDate: timestamp("transactionDate").notNull(),
  totalFees: numeric("totalFees", { precision: 10, scale: 2 }).notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Spend history table (daily spend tracking)
 */
export const spendHistory = pgTable("spend_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobPostingId: integer("jobPostingId").notNull(),
  effectiveDate: timestamp("effectiveDate").notNull(),
  dailySpend: numeric("dailySpend", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SpendHistory = typeof spendHistory.$inferSelect;
export type InsertSpendHistory = typeof spendHistory.$inferInsert;

/**
 * Candidate metrics table (pipeline tracking)
 */
export const candidateMetrics = pgTable("candidate_metrics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roleId: integer("roleId").notNull(),
  date: timestamp("date").notNull(),
  source: candidateSourceEnum("source").notNull(),
  applicants: integer("applicants").default(0).notNull(),
  screened: integer("screened").default(0).notNull(),
  interviewed: integer("interviewed").default(0).notNull(),
  offered: integer("offered").default(0).notNull(),
  hired: integer("hired").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CandidateMetric = typeof candidateMetrics.$inferSelect;
export type InsertCandidateMetric = typeof candidateMetrics.$inferInsert;

/**
 * ClickUp Clients - Fulfilment section
 * Stores client information from ClickUp for the Fulfilment dashboard
 */
export const clickupClients = pgTable("clickup_clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clickupTaskId: varchar("clickup_task_id", { length: 64 }).notNull().unique(),
  clickupUrl: text("clickup_url"),
  clientName: text("client_name").notNull(),
  brandName: text("brand_name"),
  company: text("company"),
  status: varchar("status", { length: 64 }),
  defcon: integer("defcon").notNull().default(3),
  amOwner: text("am_owner"),
  ppcOwner: text("ppc_owner"),
  creativeOwner: text("creative_owner"),
  podOwner: text("pod_owner"),
  totalAsinsFam: text("total_asins_fam"),
  totalAsinsPpc: text("total_asins_ppc"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClickUpClient = typeof clickupClients.$inferSelect;
export type InsertClickUpClient = typeof clickupClients.$inferInsert;
