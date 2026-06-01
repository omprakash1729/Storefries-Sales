-- 🚀 Add reminder and follow-up columns to sales_accounts table
ALTER TABLE sales_accounts ADD COLUMN IF NOT EXISTS "reminderType" TEXT DEFAULT 'none';
ALTER TABLE sales_accounts ADD COLUMN IF NOT EXISTS "reminderDate" TEXT;
ALTER TABLE sales_accounts ADD COLUMN IF NOT EXISTS "reminderClosed" BOOLEAN DEFAULT FALSE;
