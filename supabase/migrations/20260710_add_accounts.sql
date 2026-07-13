-- Insert new accounts for July 10, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Fasta Pizza', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'qualified', 'Not Picked - Madhu Radhakrishnan - Spoke again - They are from perungudi - Asked for offline meeting', '2026-07-10T10:00:00.000Z'),
('Odyssey', 'Bhuvaneshwari', 'Other', 'July 2026', 'qualified', 'Wrong Number', '2026-07-10T10:05:00.000Z'),
('Pricol', 'Bhuvaneshwari', 'Other', 'July 2026', 'qualified', 'Siddhart Malhotra - Not interested', '2026-07-10T10:10:00.000Z'),
('5k car care', 'Bhuvaneshwari', 'Other', 'July 2026', 'qualified', 'Praveen - did not pick , sent WA message', '2026-07-10T10:15:00.000Z'),
('Relaxo Footwear', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'Jagrit Choudhar - 9199057171 - not required (have big team already)', '2026-07-10T10:20:00.000Z'),
('RMKV Silks', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'He is nusy in the event work', '2026-07-10T10:25:00.000Z'),
('Neeman''s', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'prospect', 'Nobody picked up the call', '2026-07-10T10:30:00.000Z'),
('Urbanwood', 'Bhuvaneshwari', 'Other', 'July 2026', 'prospect', 'Not reachable', '2026-07-10T10:35:00.000Z');

-- Insert contacts for the new accounts where applicable
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Fasta Pizza', 'Madhu Radhakrishnan', NULL, NULL, NULL, 'Spoke again - They are from perungudi - Asked for offline meeting', '2026-07-10T10:01:00.000Z'),
('Pricol', 'Siddhart Malhotra', NULL, NULL, NULL, 'Not interested', '2026-07-10T10:11:00.000Z'),
('5k car care', 'Praveen', NULL, NULL, NULL, 'did not pick , sent WA message', '2026-07-10T10:16:00.000Z'),
('Relaxo Footwear', 'Jagrit Choudhar', '9199057171', NULL, NULL, 'not required (have big team already)', '2026-07-10T10:21:00.000Z');
