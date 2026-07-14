-- Insert new accounts for July 13, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Sri Chakra Fertility', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'Krishna Murthi Reddy - Head of OP and Marketing 9642431155, he is in a meeting , will get back later.', '2026-07-13T10:00:00.000Z'),
('Zazzle Salons', 'Bhuvaneshwari', 'Beauty & Wellness', 'July 2026', 'prospect', 'Number Busy', '2026-07-13T10:05:00.000Z'),
('Tea bench/Zwarma', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Did not pickup - Dinesh - Founder - 9841784263', '2026-07-13T10:10:00.000Z'),
('RMKV Silks', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'Will get back later', '2026-07-13T10:15:00.000Z'),
('Fazta Pizza', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Not yet answered', '2026-07-13T10:20:00.000Z'),
('5K Car Care', 'Bhuvaneshwari', 'Automotive', 'July 2026', 'prospect', 'nobody picked', '2026-07-13T10:25:00.000Z'),
('Slam Fitness', 'Bhuvaneshwari', 'Fitness & Wellness', 'July 2026', 'prospect', 'Nobody picked', '2026-07-13T10:30:00.000Z'),
('Namma veedu Vasanta Bhavan', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'qualified', 'Call me after 4pm on 14.07.2026', '2026-07-13T10:35:00.000Z'),
('Ajfan', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'qualified', 'Spoke through linkedin - he replied saying will get back after 3 days.', '2026-07-13T10:40:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Sri Chakra Fertility', 'Krishna Murthi Reddy', '9642431155', 'Head of OP and Marketing', NULL, 'he is in a meeting , will get back later.', '2026-07-13T10:01:00.000Z'),
('Tea bench/Zwarma', 'Dinesh', '9841784263', 'Founder', NULL, 'Did not pickup', '2026-07-13T10:11:00.000Z');
