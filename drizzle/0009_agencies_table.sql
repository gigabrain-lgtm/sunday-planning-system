-- Create agencies table for storing agency overrides
CREATE TABLE IF NOT EXISTS "agencies" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "slackChannelId" varchar(255),
  "department" varchar(255) NOT NULL,
  "logo" varchar(255),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
