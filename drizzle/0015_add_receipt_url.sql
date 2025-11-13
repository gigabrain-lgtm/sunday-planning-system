-- Add receiptUrl field to payment_requests table
ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "receiptUrl" text;
