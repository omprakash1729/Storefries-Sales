-- Insert new accounts for July 09, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('AHS', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'she will tell her team to contact me', '2026-07-09T10:00:00.000Z'),
('Traya Health', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'we dont outsource', '2026-07-09T10:05:00.000Z'),
('The Esthetic Clinics', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'I will call you back later', '2026-07-09T10:10:00.000Z'),
('Hitech Labs', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'No incoming allowed temporarily , website number - not needed ( need to look other way no persons in linkedin too)', '2026-07-09T10:15:00.000Z'),
('Berkowits', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'We dont require that now', '2026-07-09T10:20:00.000Z'),
('Apollo', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'In a meeting call me tomorrow', '2026-07-09T10:25:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('AHS', 'Roshini Abbhi', '9930928921', NULL, NULL, 'she will tell her team to contact me', '2026-07-09T10:01:00.000Z'),
('AHS', 'Gaurav Paul', '8794763758', NULL, NULL, NULL, '2026-07-09T10:02:00.000Z'),
('Traya Health', 'Kriti Bhuie', NULL, NULL, NULL, 'send mail - Kritibhuie@traya.health', '2026-07-09T10:06:00.000Z'),
('Traya Health', 'Harsh', '8939607384', NULL, NULL, 'we dont outsource', '2026-07-09T10:07:00.000Z'),
('The Esthetic Clinics', 'Sukant Raorane', '9819326524', NULL, NULL, 'I will call you back later', '2026-07-09T10:11:00.000Z'),
('Hitech Labs', 'CEO', NULL, 'CEO', NULL, 'No incoming allowed temporarily , website number - not needed ( need to look other way no persons in linkedin too)', '2026-07-09T10:16:00.000Z'),
('Berkowits', 'Dhananjay', '8826397606', NULL, NULL, 'We dont require that now', '2026-07-09T10:21:00.000Z'),
('Apollo', 'Gaurav Phogat', '9811754954', NULL, NULL, 'In a meeting call me tomorrow', '2026-07-09T10:26:00.000Z');
