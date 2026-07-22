-- Insert new accounts for July 21, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Geetham', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Follow up message sent', '2026-07-21T10:00:00.000Z'),
('Paragon Restaurant', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Busy', '2026-07-21T10:05:00.000Z'),
('Madras Coffee house', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'call me by second half of wednesday', '2026-07-21T10:10:00.000Z'),
('Sterling Holidays', 'Bhuvaneshwari', 'Hospitality', 'July 2026', 'prospect', 'Introduced our product through whatsapp', '2026-07-21T10:15:00.000Z'),
('Maatram''s - South Indian coffee house', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'did not pick - 9842247496 told to speak with him', '2026-07-21T10:20:00.000Z'),
('Lalitha Jewellery', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'Nobody Picked', '2026-07-21T10:25:00.000Z'),
('Style Spa Furniture', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'Call back tomorrow', '2026-07-21T10:30:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Madras Coffee house', 'Chandra Prabha Annoyji Rao', '9962504656', NULL, NULL, 'call me by second half of wednesday', '2026-07-21T10:11:00.000Z'),
('Maatram''s - South Indian coffee house', 'Amarnath', '9843921316', NULL, NULL, 'did not pick - 9842247496 told to speak with him', '2026-07-21T10:21:00.000Z');
