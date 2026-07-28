-- Insert new accounts for July 27, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Woodpecker Furniture', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'DId not pick up', '2026-07-27T10:00:00.000Z'),
('Wed Tree', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'Sent WA message', '2026-07-27T10:05:00.000Z'),
('Paramounts Clothing', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'he is not working there anymore', '2026-07-27T10:10:00.000Z'),
('Orbito Asia Diagnostics', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'not picking', '2026-07-27T10:15:00.000Z'),
('Maatram''s - South Indian coffee house', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Call them on next week wednesday', '2026-07-27T10:20:00.000Z'),
('Lalitha Jewellery', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'nobody picked', '2026-07-27T10:25:00.000Z'),
('Style Spa Furniture', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'call back on monday', '2026-07-27T10:30:00.000Z'),
('Geetham', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'In a meeting', '2026-07-27T10:35:00.000Z'),
('Page 3 Luxury Salon', 'Bhuvaneshwari', 'Fitness & Wellness', 'July 2026', 'prospect', 'Revanth Roy said not interested', '2026-07-27T10:40:00.000Z'),
('Kohler India', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'Nobody picked , sent Linkedin Connection', '2026-07-27T10:45:00.000Z'),
('Dr. Agravat', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'Spoke in Hindi , then called again it was busy', '2026-07-27T10:50:00.000Z'),
('white Forest', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'No body picked', '2026-07-27T10:55:00.000Z'),
('Fasta Pizza', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Follow up call made , message sent for venue details', '2026-07-27T11:00:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Woodpecker Furniture', 'Keerthana', NULL, NULL, NULL, 'DId not pick up', '2026-07-27T10:01:00.000Z'),
('Page 3 Luxury Salon', 'Revanth Roy', NULL, NULL, NULL, 'said not interested', '2026-07-27T10:41:00.000Z');

-- Combine similar accounts to make them unique
UPDATE sales_accounts SET name = 'Geetham' WHERE name ILIKE '%geetham%restaurant%';
UPDATE account_contacts SET "accountName" = 'Geetham' WHERE "accountName" ILIKE '%geetham%restaurant%';
