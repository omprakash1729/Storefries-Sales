-- 👥 Add account_contacts table for per-account contact management
CREATE TABLE IF NOT EXISTS account_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "accountName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  phone TEXT,
  designation TEXT,
  linkedin TEXT,
  remark TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ⚡️ Enable Real-time so contact changes stream live
ALTER PUBLICATION supabase_realtime ADD TABLE account_contacts;

-- 🔒 Row Level Security (internal app — allow all)
ALTER TABLE account_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable full access to users" ON account_contacts FOR ALL USING (true) WITH CHECK (true);
