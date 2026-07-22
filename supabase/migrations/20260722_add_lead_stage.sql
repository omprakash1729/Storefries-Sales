-- Add leadStage and followUpCount columns to sales_accounts table
ALTER TABLE sales_accounts ADD COLUMN IF NOT EXISTS "leadStage" text;
ALTER TABLE sales_accounts ADD COLUMN IF NOT EXISTS "followUpCount" integer DEFAULT 0;
