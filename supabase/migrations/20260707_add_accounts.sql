-- Insert new accounts for July 07, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Mysore Saree Udyog', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'call back after 1 hour - did not pick sent him msg via WA', '2026-07-07T10:00:00.000Z'),
('RMKV Silks', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'Will confirm by friday or Saturday', '2026-07-07T10:05:00.000Z'),
('Saravana Stores', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'He is in meeting - told to send message', '2026-07-07T10:10:00.000Z'),
('Lucid', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'didnt pick or call back after some times', '2026-07-07T10:15:00.000Z'),
('Hitech', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'didnt pick or call back after some times', '2026-07-07T10:20:00.000Z'),
('SRL Agilus', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'qualified', 'didnt pick or call back after some times', '2026-07-07T10:25:00.000Z'),
('Go Colors', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'didnt pick or call back after some times', '2026-07-07T10:30:00.000Z'),
('Twin Birds', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'didnt pick or call back after some times', '2026-07-07T10:35:00.000Z'),
('BLiss club', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'qualified', 'didnt pick or call back after some times', '2026-07-07T10:40:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Mysore Saree Udyog', 'Rupeshkumar', '7829515551', NULL, NULL, 'call back after 1 hour - did not pick sent him msg via WA', '2026-07-07T10:01:00.000Z'),
('Saravana Stores', 'Vaidhyanathan', '89399748777', 'VP OP', NULL, 'He is in meeting - told to send message', '2026-07-07T10:11:00.000Z');
