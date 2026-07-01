-- Insert new accounts for June 30, 2026

INSERT INTO sales_accounts (name, owner, industry, month, status, reason, "createdAt")
VALUES
('Sparsh Hospital', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'prospect', 'visited website - spoke with srinivas he said the only way to connect is through mail with nawaz - sent followup mail to nawaz', '2026-06-30T10:00:00.000Z'),
('Indira IVF', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'demo', 'Prasoontomar meeting booked at 6.30 pm - 9044433270', '2026-06-30T10:05:00.000Z'),
('Narayana Health', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'prospect', 'Ashutosh - 8422912155- called but did not speak - udit singh-9874573737 - we can connect on monday , will condirm availability thorugh whatsapp', '2026-06-30T10:10:00.000Z'),
('Sakhiya Skin Clinic', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'prospect', 'did not pick the call, need to call back later', '2026-06-30T10:15:00.000Z'),
('Cloudnine', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'prospect', 'called but no response, will try calling again after some time', '2026-06-30T10:20:00.000Z'),
('Yatharth Hospitals', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'prospect', 'did not answer, follow up later in the day', '2026-06-30T10:25:00.000Z'),
('Dava India Pharmacy', 'Bhuvaneshwari', 'Healthcare', 'June 2026', 'prospect', 'no response, call back after some time', '2026-06-30T10:30:00.000Z'),
('Enamor', 'Bhuvaneshwari', 'Apparel & Footwear', 'June 2026', 'prospect', 'did not pick up the call, try connecting later', '2026-06-30T10:35:00.000Z'),
('Zivame', 'Bhuvaneshwari', 'Apparel & Footwear', 'June 2026', 'prospect', 'call went unanswered, need to connect later', '2026-06-30T10:40:00.000Z'),
('Neerus', 'Bhuvaneshwari', 'Apparel & Footwear', 'June 2026', 'prospect', 'did not pick up, call back after some time', '2026-06-30T10:45:00.000Z'),
('Kankatala', 'Bhuvaneshwari', 'Apparel & Footwear', 'June 2026', 'prospect', 'no reply on the call, will retry after a short interval', '2026-06-30T10:50:00.000Z');

-- Insert contacts for the new accounts
INSERT INTO account_contacts ("accountName", "contactName", phone, designation, linkedin, remark, "createdAt")
VALUES
('Sparsh Hospital', 'Srinivas', NULL, NULL, NULL, 'Spoke with him, said the only way to connect is through mail with nawaz', '2026-06-30T10:01:00.000Z'),
('Sparsh Hospital', 'Nawaz', NULL, NULL, NULL, 'Sent followup mail', '2026-06-30T10:02:00.000Z'),
('Indira IVF', 'Prasoontomar', '9044433270', NULL, NULL, 'Meeting booked at 6.30 pm', '2026-06-30T10:06:00.000Z'),
('Narayana Health', 'Ashutosh', '8422912155', NULL, NULL, 'Called but did not speak', '2026-06-30T10:11:00.000Z'),
('Narayana Health', 'Udit Singh', '9874573737', NULL, NULL, 'We can connect on monday, will confirm availability through whatsapp', '2026-06-30T10:12:00.000Z');
