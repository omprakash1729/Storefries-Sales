-- Insert new accounts for July 1, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Sakhuya Skin Clinic', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'New lead Sahil Ramani, called by 4pm - dialled number is busy', '2026-07-01T10:00:00.000Z'),
('DermaVue Clinics', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'Newlead Sarath Sivan, called by evening but it said busy', '2026-07-01T10:05:00.000Z'),
('Venkat center', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'didnot pick the call. sent message via linkedin. She asked the purpose for calling and cut the call afyer that - Please contact by friday 11am', '2026-07-01T10:10:00.000Z'),
('RMKV Silks', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'prospect', 'will go though your deck and will let you know', '2026-07-01T10:15:00.000Z'),
('Basics Llife', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'rejected', 'Speaking with someone else thank you so much I dont require a saas platform - sent over the pitch deck', '2026-07-01T10:20:00.000Z'),
('Wockharft Hospitals', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'not picked , call after 2 days', '2026-07-01T10:25:00.000Z'),
('Kangaroo Kids', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'not picked , call after 2 days', '2026-07-01T10:30:00.000Z'),
('Gleneagles', 'Bhuvaneshwari', 'Healthcare', 'July 2026', 'prospect', 'not picked , call after 2 days', '2026-07-01T10:35:00.000Z'),
('Blissclub', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'prospect', 'not picked , call after 2 days', '2026-07-01T10:40:00.000Z'),
('Tasva', 'Bhuvaneshwari', 'Apparel & Footwear', 'July 2026', 'prospect', 'not picked , call after 2 days', '2026-07-01T10:45:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Sakhuya Skin Clinic', 'Sahil Ramani', '7567764046', 'sales and marketing Specialist', NULL, 'call me after 4.pm - called by 4pm - dialled number is busy', '2026-07-01T10:01:00.000Z'),
('DermaVue Clinics', 'Sarath Sivan', '7907198368', 'DGM Head', NULL, 'call me by evening - called but it said busy', '2026-07-01T10:06:00.000Z'),
('Venkat center', 'Dr.Fizzah Asgar', '9611563786', NULL, 'Sent message via linkedin', 'She asked the purpose for calling and cut the call afyer that - Please contact by friday 11am', '2026-07-01T10:11:00.000Z'),
('RMKV Silks', 'Srinivas Nurani', '9538866624', NULL, NULL, 'will go though your deck and will let you know', '2026-07-01T10:16:00.000Z');
