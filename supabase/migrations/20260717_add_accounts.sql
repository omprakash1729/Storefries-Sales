-- Insert new accounts for July 17, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('CK''s Bakery', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Manuranjith - Founder - 9176674771 - did not pick', '2026-07-17T10:00:00.000Z'),
('RJR Herbals', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', '7871111115 - will call back Tamil Nadu and pondicherry', '2026-07-17T10:05:00.000Z'),
('Chai Waale', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', '9940083169 - call back on monday', '2026-07-17T10:10:00.000Z'),
('Murugan Idly Shop', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Prasad - 8007489000 shared his team members contact to speak with Vignesh 9840837127 - he is in Delhi when he gets back to chennai , will try to meet', '2026-07-17T10:15:00.000Z'),
('Saravana Bhavan', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'did not picked', '2026-07-17T10:20:00.000Z'),
('Sangeetha Restaurant', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'did not picked', '2026-07-17T10:25:00.000Z'),
('Welona', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'rejected', 'Rejected', '2026-07-17T10:30:00.000Z'),
('Narayana Health', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'not yet confirmed with the team', '2026-07-17T10:35:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('CK''s Bakery', 'Manuranjith', '9176674771', 'Founder', NULL, 'did not pick', '2026-07-17T10:01:00.000Z'),
('Murugan Idly Shop', 'Prasad', '8007489000', NULL, NULL, 'shared team members contact', '2026-07-17T10:16:00.000Z'),
('Murugan Idly Shop', 'Vignesh', '9840837127', NULL, NULL, 'in Delhi, meet when back in Chennai', '2026-07-17T10:17:00.000Z');
