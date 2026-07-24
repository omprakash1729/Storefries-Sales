-- Insert new accounts for July 23, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Narayana health', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'follow up', '2026-07-23T10:00:00.000Z'),
('Quad fitness', 'Bhuvaneshwari', 'Fitness & Wellness', 'July 2026', 'prospect', 'follow up', '2026-07-23T10:05:00.000Z'),
('Bombay kulfi', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Manish - 9894251947, alt 9894465827', '2026-07-23T10:10:00.000Z'),
('Ajfan', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'They said no', '2026-07-23T10:15:00.000Z'),
('Woodpecker furniture', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'Redirected to bot call', '2026-07-23T10:20:00.000Z'),
('Maatram''s - South Indian coffee house', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'whatsapp them', '2026-07-23T10:25:00.000Z'),
('Fasta Pizza', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'did not pick', '2026-07-23T10:30:00.000Z'),
('Chai waale', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'did not pick', '2026-07-23T10:35:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Bombay kulfi', 'Manish', '9894251947', NULL, NULL, 'Alternate number: 9894465827', '2026-07-23T10:11:00.000Z');
