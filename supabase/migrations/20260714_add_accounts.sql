-- Insert new accounts for July 14, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Narayana Health', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'tried calling by 1.45pm did not pick and sent whatsapp message - will get back after 7pm today', '2026-07-14T10:00:00.000Z'),
('Paulson', 'Bhuvaneshwari', 'Retail (General)', 'July 2026', 'prospect', 'did not pick nobody picked up', '2026-07-14T10:05:00.000Z'),
('Pixies', 'Bhuvaneshwari', 'Other', 'July 2026', 'prospect', '1pm - sent mail and whatsapp', '2026-07-14T10:10:00.000Z'),
('Fasta pizza', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'Not picking', '2026-07-14T10:15:00.000Z'),
('Bloggers Passion(Affiliate)', 'Bhuvaneshwari', 'Digital Marketing', 'July 2026', 'prospect', 'Send mail to anil@bloggerspassion.com - will see if it fits us', '2026-07-14T10:20:00.000Z'),
('Shree Mithai', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'did not pick the call', '2026-07-14T10:25:00.000Z'),
('Protein Xclusive', 'Bhuvaneshwari', 'Fitness & Wellness', 'July 2026', 'prospect', 'call by second half of thursday', '2026-07-14T10:30:00.000Z'),
('Tender cuts', 'Bhuvaneshwari', 'Food & Beverage', 'July 2026', 'prospect', 'call wednesday 5pm', '2026-07-14T10:35:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Narayana Health', 'Udit', '9874573737', 'Brand Marketing', NULL, 'tried calling by 1.45pm did not pick and sent whatsapp message - will get back after 7pm today', '2026-07-14T10:01:00.000Z'),
('Paulson', 'Sathish', '9176461444', NULL, NULL, 'did not pick nobody picked up', '2026-07-14T10:06:00.000Z'),
('Pixies', 'Dinesh', NULL, 'Founder and CEO', NULL, 'contact@pixies.in 1pm - sent mail and whatsapp', '2026-07-14T10:11:00.000Z'),
('Bloggers Passion(Affiliate)', 'Anil', NULL, NULL, NULL, 'Send mail to anil@bloggerspassion.com - will see if it fits us', '2026-07-14T10:21:00.000Z');
