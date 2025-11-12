-- Add completion fields to payment_requests table
ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "completionPaymentLink" text,
ADD COLUMN IF NOT EXISTS "completionAmount" text,
ADD COLUMN IF NOT EXISTS "completedAt" timestamp,
ADD COLUMN IF NOT EXISTS "completedBy" text,
ADD COLUMN IF NOT EXISTS "completionClickupTaskId" text;

-- Add 'completed' status to payment_status enum
ALTER TYPE "payment_status" ADD VALUE IF NOT EXISTS 'completed';
