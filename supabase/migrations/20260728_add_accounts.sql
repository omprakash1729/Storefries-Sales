-- Insert new accounts for July 28, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Deyga', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'call me @11.30 am tommorow(29.07.2026) , if I am free we will connect for a short demo', '2026-07-28T10:00:00.000Z'),
('Fasta Pizza', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'tried with storefries number , did not pick , but picked whatsapp call from om number and told to call on nomral call , but did not pick , asked via whatsapp for meeting venue and time', '2026-07-28T10:05:00.000Z'),
('Vilvah', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'not interested', '2026-07-28T10:10:00.000Z'),
('Tender Cuts', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'havenot picked', '2026-07-28T10:15:00.000Z'),
('Madras coffee house', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'not picked', '2026-07-28T10:20:00.000Z'),
('Matram South India coffee house', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'busy', '2026-07-28T10:25:00.000Z'),
('Style Spa', 'Bhuvaneshwari', 'Retail', 'July 2026', 'prospect', 'Busy', '2026-07-28T10:30:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Deyga', 'Raguram', '9524875599', NULL, NULL, 'call me @11.30 am tommorow(29.07.2026) , if I am free we will connect for a short demo', '2026-07-28T10:01:00.000Z'),
('Vilvah', 'Kiruthika', '9894875566', 'founder', NULL, 'not interested', '2026-07-28T10:11:00.000Z'),
('Tender Cuts', 'Sasikumar Kallanai', '9884476688', 'founder and CEO', NULL, 'havenot picked', '2026-07-28T10:16:00.000Z');
