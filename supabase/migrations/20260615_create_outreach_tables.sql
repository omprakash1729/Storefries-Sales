-- 👥 Create tables for BNI Contacts and Franchise Consultants

CREATE TABLE IF NOT EXISTS bni_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  company TEXT,
  designation TEXT,
  "bniChapter" TEXT,
  phone TEXT,
  email TEXT,
  linkedin TEXT,
  status TEXT NOT NULL DEFAULT 'reached_out',
  medium TEXT DEFAULT 'LinkedIn',
  owner TEXT NOT NULL,
  remark TEXT
);

CREATE TABLE IF NOT EXISTS franchise_consultants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  company TEXT,
  designation TEXT,
  region TEXT,
  phone TEXT,
  email TEXT,
  linkedin TEXT,
  status TEXT NOT NULL DEFAULT 'reached_out',
  medium TEXT DEFAULT 'LinkedIn',
  owner TEXT NOT NULL,
  remark TEXT
);

-- ⚡️ Enable Real-time streaming for both tables safely (idempotent across all PG versions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'bni_contacts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bni_contacts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'franchise_consultants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE franchise_consultants;
  END IF;
END $$;

-- 🔒 Row Level Security Setup (Allow all internal access)
ALTER TABLE bni_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_consultants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access to users" ON bni_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access to users" ON franchise_consultants FOR ALL USING (true) WITH CHECK (true);

-- 📊 Insert Initial Franchise Consultants Seed Data
INSERT INTO franchise_consultants (id, name, company, designation, phone, email, linkedin, status, medium, owner, remark)
VALUES 
-- Existing consultants (updated remarks with WhatsApp history before Call outreach)
('fc-1', 'Arshi Khan', 'Self', 'Franchise consultant', '917415599049', NULL, 'https://www.linkedin.com/in/arshi-khan-2abb911a2/', 'replied', 'Call', 'Om Prakash', 'Call Outreach: Attended - Send pitch through Whatsapp. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]'),
('fc-2', 'Javeed A. Khan', 'Self', 'Franchise consultant', '917619688070', NULL, 'https://www.linkedin.com/in/javeedahamedkhan/', 'replied', 'Call', 'Om Prakash', 'Call Outreach: Attended - Send pitch through Whatsapp. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]'),
('fc-3', 'Sumanth shetty', 'Self', 'Franchise consultant', '919900701201', NULL, 'https://www.linkedin.com/in/sumanth-shetty-70905a148/', 'reached_out', 'Call', 'Om Prakash', 'Call Outreach: Didn''t pick the call. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]'),
('fc-4', 'Vimal V', 'Self', 'Franchise consultant', '919946557100', NULL, 'https://www.linkedin.com/in/vimalv1/', 'replied', 'Call', 'Om Prakash', 'Call Outreach: Attended - Send pitch through Whatsapp. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]'),

-- New consultants (WhatsApp outreach)
('fc-5', 'Priyanka Panchal', 'Self', 'Franchise consultant', '918140038080', NULL, 'https://www.linkedin.com/in/priyanka-panchal-3a9b94232/', 'replied', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Replied - Not Attended'),
('fc-6', 'Amar Lunia', 'Self', 'Franchise consultant', '919035027699', NULL, 'https://www.linkedin.com/in/amar-lunia-058273121/', 'reached_out', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Not Replied - Not Attended'),
('fc-7', 'Nilesh khatod', 'Self', 'Franchise consultant', '919161225877', NULL, 'https://www.linkedin.com/in/nilesh-khatod-715145b1/', 'replied', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Replied - Scheduled demo'),
('fc-8', 'Kishin Thakur', 'Self', 'Franchise consultant', '919930384641', NULL, 'https://www.linkedin.com/in/kishinthakur/', 'demo_booked', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Replied - Attended'),
('fc-9', 'Vijayasaradhi Kolasani', 'Self', 'Franchise consultant', '919100094361', NULL, 'https://www.linkedin.com/in/vijayasaradhi-kolasani-71421325/', 'replied', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Replied - Not Attended'),
('fc-10', 'Anupam Srivastava', 'Self', 'Franchise consultant', '919819523666', NULL, 'https://www.linkedin.com/in/chefanupamsrivastava/', 'replied', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Replied - Not Attended'),
('fc-11', 'Ravikumar Chandrashekar', 'Self', 'Franchise consultant', '919847012317', NULL, 'https://www.linkedin.com/in/raavikumaar/', 'demo_booked', 'WhatsApp', 'Om Prakash', 'WhatsApp Outreach: Message Sent - Replied - Attended')
ON CONFLICT (id) DO UPDATE SET
  remark = EXCLUDED.remark,
  status = EXCLUDED.status,
  medium = EXCLUDED.medium,
  owner = EXCLUDED.owner;

-- 📊 Migrate BNI Contacts from sales_accounts to bni_contacts
DELETE FROM sales_accounts 
WHERE name IN ('Santosh Patil - BNI Bhoomi Formec Media LLP', 'Enlight Web Services (BNI Solitaire)', 'Zero4Studio (BNI Harmony)');

INSERT INTO bni_contacts (id, name, company, designation, "bniChapter", phone, email, linkedin, status, medium, owner, remark)
VALUES
('bni-1', 'Santosh Patil', 'Formec Media LLP', 'Digital/Advertising', 'BNI Bhoomi', NULL, NULL, NULL, 'replied', 'Call', 'Om Prakash', 'He will share his timing for meeting on 06/06/2026'),
('bni-2', 'Manisha', 'Enlight Web Services', 'Member', 'BNI Solitaire', NULL, NULL, NULL, 'demo_booked', 'WhatsApp', 'Om Prakash', 'Further Discussion - Venkat Sir need to send Whatsapp message to Manisha. She asked for a recorded video'),
('fc-12', 'Zero4Studio Contact', 'Zero4Studio', 'Member', 'BNI Harmony', NULL, NULL, NULL, 'demo_booked', 'Call', 'Om Prakash', 'Follow back with him 05.06.2026')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  company = EXCLUDED.company,
  designation = EXCLUDED.designation,
  "bniChapter" = EXCLUDED."bniChapter",
  status = EXCLUDED.status,
  medium = EXCLUDED.medium,
  owner = EXCLUDED.owner,
  remark = EXCLUDED.remark;



