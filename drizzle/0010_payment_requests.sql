-- Create enums
DO $$ BEGIN
  CREATE TYPE "payment_type" AS ENUM('credit_card', 'ach', 'wire', 'invoice');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "account_type" AS ENUM('checking', 'savings');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_requests table
CREATE TABLE IF NOT EXISTS "payment_requests" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "userId" integer NOT NULL,
  "userName" text,
  "paymentType" "payment_type" NOT NULL,
  
  -- Credit Card fields
  "paymentLink" text,
  "description" text,
  "dueDate" varchar(50),
  "serviceStartDate" varchar(50),
  
  -- ACH fields
  "achBankName" text,
  "achBankAddress" text,
  "achRoutingNumber" varchar(50),
  "achAccountNumber" varchar(50),
  "achAccountType" "account_type",
  "achAccountHolderName" text,
  
  -- Wire fields
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
  
  -- Invoice fields
  "invoiceUrl" text,
  "invoiceEmail" varchar(320),
  
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
