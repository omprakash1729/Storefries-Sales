export type AccountStatus =
  | "new_lead"
  | "prospect"
  | "qualified"
  | "demo"
  | "proposal_sent"
  | "trial"
  | "rejected";

export type LeadStage =
  | "identify_account"
  | "active_platform_check"
  | "initial_contact"
  | "social_engagement"
  | "first_email_whatsapp"
  | "cold_call"
  | "demo"
  | "newsletter"
  | "onboarding";

export interface Account {
  id: string;
  name: string;
  owner: string;
  industry: string;
  month: string;
  status: AccountStatus;
  leadStage?: LeadStage;
  reason?: string;
  createdAt?: string; // ISO timestamp
  followUpCount?: number;
  reminderType?: "none" | "reach_again" | "followup";
  reminderDate?: string; // ISO timestamp
  reminderClosed?: boolean;
}

export interface AccountContact {
  id: string;
  accountName: string;
  contactName: string;
  phone?: string;
  designation?: string;
  linkedin?: string;
  remark?: string;
  createdAt?: string;
}

export type RepColor = "blue" | "green" | "amber" | "teal" | "purple" | "red";

export interface SalesRep {
  name: string;
  color: RepColor;
}

export const STATUS_LABEL: Record<AccountStatus, string> = {
  new_lead: "New Lead",
  prospect: "Prospect",
  qualified: "Qualified",
  demo: "Demo Attended",
  proposal_sent: "Proposal Sent",
  trial: "Trial Started",
  rejected: "Rejected",
};

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  identify_account: "1. Identify Account & Contact",
  active_platform_check: "2. Active Platform Check",
  initial_contact: "3. Initial Contact (Phone/Email)",
  social_engagement: "4. Social Engagement",
  first_email_whatsapp: "5. First Email & WhatsApp",
  cold_call: "6. Cold Call",
  demo: "7. Demo",
  newsletter: "8. Newsletter",
  onboarding: "9. Onboarding",
};

export const REP_COLOR_CLASS: Record<RepColor, string> = {
  blue: "bg-sky-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  teal: "bg-teal-500",
  purple: "bg-violet-500",
  red: "bg-rose-500",
};

export const REP_COLOR_SOFT: Record<RepColor, string> = {
  blue: "bg-sky-100 text-sky-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  teal: "bg-teal-100 text-teal-700",
  purple: "bg-violet-100 text-violet-700",
  red: "bg-rose-100 text-rose-700",
};

export const INDUSTRIES = [
  "Food & Beverage",
  "Healthcare",
  "Apparel & Footwear",
  "Electronics Retail",
  "Education",
  "Beauty & Wellness",
  "Automotive",
  "Automotive Services",
  "Jewellery Retail",
  "Laundry Services",
  "Furniture Retail",
  "Financial Services",
  "Hospitality",
  "Digital Marketing",
  "Digital/Advertising",
  "Retail (General)",
  "Supermarket & Grocery",
  "Fitness & Wellness",
  "Food Processing",
  "Construction",
  "Other",
];

export type OutreachStatus = "reached_out" | "medium" | "read" | "replied" | "demo_booked";

export interface BniContact {
  id: string;
  createdAt?: string;
  name: string;
  company?: string;
  designation?: string;
  bniChapter?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  status: OutreachStatus;
  medium?: "LinkedIn" | "WhatsApp" | "Email" | "Call";
  owner: string;
  remark?: string;
}

export interface FranchiseConsultant {
  id: string;
  createdAt?: string;
  name: string;
  company?: string;
  designation?: string;
  region?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  status: OutreachStatus;
  medium?: "LinkedIn" | "WhatsApp" | "Email" | "Call";
  owner: string;
  remark?: string;
}

export const OUTREACH_STATUS_LABEL: Record<OutreachStatus, string> = {
  reached_out: "Reached Out",
  medium: "Medium",
  read: "Read",
  replied: "Replied",
  demo_booked: "Demo Booked",
};
