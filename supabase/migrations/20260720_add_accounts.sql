-- Insert new accounts for July 20, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Chai Waale', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Picked , but not speaking', '2026-07-20T10:00:00.000Z'),
('Slam', 'Bhuvaneshwari', 'Fitness', 'July 2026', 'prospect', 'Switched off', '2026-07-20T10:05:00.000Z'),
('Secure Hospitals', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'Call back on 5pm - called back at 5 did not pick', '2026-07-20T10:10:00.000Z'),
('Sakino health care', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'tried again after last thursday , still did not picked', '2026-07-20T10:15:00.000Z'),
('Namme Veedu Vasanta Bhavan', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'rejected', 'Using rannkly , previously used fame pilot - shruthi - rejected', '2026-07-20T10:20:00.000Z'),
('Anjappar', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'rejected', 'Diwakar - 9040554521 - they are using fame pilot', '2026-07-20T10:25:00.000Z'),
('Fresh and honest', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'rejected', 'Vijin - we do not have physical Outlet', '2026-07-20T10:30:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Namme Veedu Vasanta Bhavan', 'Shruthi', NULL, NULL, NULL, 'rejected', '2026-07-20T10:21:00.000Z'),
('Anjappar', 'Diwakar', '9040554521', NULL, NULL, 'using fame pilot', '2026-07-20T10:26:00.000Z'),
('Fresh and honest', 'Vijin', NULL, NULL, NULL, 'no physical outlet', '2026-07-20T10:31:00.000Z');
