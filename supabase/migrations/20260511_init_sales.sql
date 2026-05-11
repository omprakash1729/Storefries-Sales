-- 🚀 Step 1: Create necessary tables for Accounts & Reps
CREATE TABLE IF NOT EXISTS sales_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  owner TEXT NOT NULL,
  month TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS sales_reps (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚡️ Step 2: Enable Real-time Publication so updates stream immediately to everyone using the app
ALTER PUBLICATION supabase_realtime ADD TABLE sales_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_reps;

-- 🔒 Step 3: Setup Row Level Security (Allow everyone to read/write since it is internal)
ALTER TABLE sales_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access to users" ON sales_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access to users" ON sales_reps FOR ALL USING (true) WITH CHECK (true);
