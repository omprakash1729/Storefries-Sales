-- Insert new accounts for July 16, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Narayana Health', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'Spoke with internal team , need confirmation from their side', '2026-07-16T10:00:00.000Z'),
('Shree Mithai', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'rejected', 'change status to rejected', '2026-07-16T10:05:00.000Z'),
('Namma Veedu Vasantha Bhavan', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'not picking', '2026-07-16T10:10:00.000Z'),
('Sukino Health Care', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'call back in 15minutes Suresh Naik - 8904829390 - did not pick the call', '2026-07-16T10:15:00.000Z'),
('Secure Hospitals', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', '9886653167 -Ravi Shankar CMO - call me back on monday', '2026-07-16T10:20:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Sukino Health Care', 'Suresh Naik', '8904829390', NULL, NULL, 'call back in 15minutes - did not pick the call', '2026-07-16T10:16:00.000Z'),
('Secure Hospitals', 'Ravi Shankar', '9886653167', 'CMO', NULL, 'call me back on monday', '2026-07-16T10:21:00.000Z');
