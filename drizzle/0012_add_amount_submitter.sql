-- Add amount and submitterName columns to payment_requests table
ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "submitterName" text,
ADD COLUMN IF NOT EXISTS "amount" text;
