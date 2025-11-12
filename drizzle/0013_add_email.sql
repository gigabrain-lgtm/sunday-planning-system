-- Add submitterEmail column to payment_requests table
ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "submitterEmail" text;
