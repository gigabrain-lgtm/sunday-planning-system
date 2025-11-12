-- Create payment_status enum
DO $$ BEGIN
  CREATE TYPE "payment_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to payment_requests table
ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "status" "payment_status" DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS "clickupTaskId" text,
ADD COLUMN IF NOT EXISTS "approvedAt" timestamp;

-- Update existing records to have pending status
UPDATE "payment_requests" SET "status" = 'pending' WHERE "status" IS NULL;
