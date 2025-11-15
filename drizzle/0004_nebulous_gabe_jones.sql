ALTER TABLE "hiring_priorities" DROP CONSTRAINT "hiring_priorities_jobTitle_unique";--> statement-breakpoint
ALTER TABLE "hiring_priorities" ADD COLUMN "recruiterId" integer;