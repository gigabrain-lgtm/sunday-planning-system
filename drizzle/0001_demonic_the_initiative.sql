CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings');--> statement-breakpoint
CREATE TYPE "public"."candidate_source" AS ENUM('linkedin_ads', 'headhunting');--> statement-breakpoint
CREATE TYPE "public"."hiring_priority" AS ENUM('urgent', 'high', 'medium', 'normal', 'low', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."job_assignment_status" AS ENUM('draft', 'culture_index_pending', 'workable_pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."job_posting_status" AS ENUM('active', 'paused', 'closed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('credit_card', 'ach', 'wire', 'invoice');--> statement-breakpoint
CREATE TYPE "public"."recruiter_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slackChannelId" varchar(255),
	"department" varchar(255) NOT NULL,
	"logo" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_metrics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_metrics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roleId" integer NOT NULL,
	"date" timestamp NOT NULL,
	"source" "candidate_source" NOT NULL,
	"applicants" integer DEFAULT 0 NOT NULL,
	"screened" integer DEFAULT 0 NOT NULL,
	"interviewed" integer DEFAULT 0 NOT NULL,
	"offered" integer DEFAULT 0 NOT NULL,
	"hired" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_standups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "daily_standups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"standupDate" timestamp NOT NULL,
	"taskIds" text[] NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hiring_priorities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hiring_priorities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"jobTitle" varchar(255) NOT NULL,
	"description" text,
	"priority" "hiring_priority" DEFAULT 'normal' NOT NULL,
	"jobDescription" text,
	"testQuestions" text,
	"interviewQuestions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hiring_priorities_jobTitle_unique" UNIQUE("jobTitle")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roleId" integer,
	"location" varchar(255),
	"transactionDate" timestamp NOT NULL,
	"totalFees" numeric(10, 2) NOT NULL,
	"invoiceNumber" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_assignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_assignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"recruiterId" integer NOT NULL,
	"jobTitle" varchar(255) NOT NULL,
	"agencyName" varchar(255) NOT NULL,
	"nomenclature" text,
	"cultureIndexInternalLink" text,
	"cultureIndexAssessmentLink" text,
	"workableLink" text,
	"workableJobId" varchar(50),
	"workableShortcode" varchar(50),
	"cultureIndexQuestionAdded" integer DEFAULT 0 NOT NULL,
	"status" "job_assignment_status" DEFAULT 'draft' NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_postings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roleId" integer NOT NULL,
	"jobTitle" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"dailySpend" numeric(10, 2) NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"status" "job_posting_status" DEFAULT 'active' NOT NULL,
	"totalApplicants" integer DEFAULT 0 NOT NULL,
	"linkedInJobId" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_title_mappings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_title_mappings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roleId" integer NOT NULL,
	"workableJobTitle" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"userName" text,
	"submitterName" text,
	"submitterEmail" text,
	"amount" text,
	"paymentType" "payment_type" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"clickupTaskId" text,
	"approvedAt" timestamp,
	"completionPaymentLink" text,
	"completionAmount" text,
	"completedAt" timestamp,
	"completedBy" text,
	"completionClickupTaskId" text,
	"receiptUrl" text,
	"paymentLink" text,
	"description" text,
	"dueDate" varchar(50),
	"serviceStartDate" varchar(50),
	"achBankName" text,
	"achBankAddress" text,
	"achRoutingNumber" varchar(50),
	"achAccountNumber" varchar(50),
	"achAccountType" "account_type",
	"achAccountHolderName" text,
	"wireBankName" text,
	"wireBankAddress" text,
	"wireSwiftBic" varchar(50),
	"wireRoutingNumber" varchar(50),
	"wireAccountNumber" varchar(50),
	"wireAccountType" "account_type",
	"wireBeneficiaryName" text,
	"wireBeneficiaryAddress" text,
	"wireCountry" text,
	"wireIban" varchar(100),
	"invoiceUrl" text,
	"invoiceEmail" varchar(320),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recruiters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"recruiterCode" varchar(50) NOT NULL,
	"slackChannelId" varchar(255) NOT NULL,
	"status" "recruiter_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recruiters_recruiterCode_unique" UNIQUE("recruiterCode")
);
--> statement-breakpoint
CREATE TABLE "reminder_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reminder_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"reminderType" varchar(50) NOT NULL,
	"weekNumber" integer NOT NULL,
	"year" integer NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"recipientCount" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roleName" varchar(255) NOT NULL,
	"description" text,
	"technicalInterviewer" varchar(255),
	"finalInterviewer" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_roleName_unique" UNIQUE("roleName")
);
--> statement-breakpoint
CREATE TABLE "sleep_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sleep_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"sessionId" varchar(128) NOT NULL,
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
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sleep_sessions_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE "spend_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "spend_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"jobPostingId" integer NOT NULL,
	"effectiveDate" timestamp NOT NULL,
	"dailySpend" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "standup_stats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "standup_stats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"weekNumber" integer NOT NULL,
	"year" integer NOT NULL,
	"standupsCompleted" integer DEFAULT 0,
	"standupsExpected" integer DEFAULT 5,
	"completionRate" varchar(10),
	"avgTasksPerStandup" varchar(10),
	"totalBlockersReported" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_blockers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_blockers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"taskId" varchar(255) NOT NULL,
	"taskName" text NOT NULL,
	"userId" integer NOT NULL,
	"blockerType" varchar(50),
	"description" text NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp,
	"resolvedBy" integer,
	"resolutionNotes" text
);
--> statement-breakpoint
CREATE TABLE "visualization_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visualization_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"versionDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visualizations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visualizations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_submissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "weekly_submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"submissionType" varchar(20) NOT NULL,
	"weekNumber" integer NOT NULL,
	"year" integer NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL,
	"slackMessageTs" text,
	"totalTasks" integer DEFAULT 0,
	"completedTasks" integer DEFAULT 0,
	"inProgressTasks" integer DEFAULT 0,
	"newTasks" integer DEFAULT 0,
	"flaggedTasks" integer DEFAULT 0,
	"taskData" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "microsoftAccessToken" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "microsoftRefreshToken" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "microsoftTokenExpiry" timestamp;