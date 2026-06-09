export type AccountStatus = "new_lead" | "prospect" | "demo" | "proposal_sent" | "trial" | "rejected";

export interface Account {
  id: string;
  name: string;
  owner: string;
  industry: string;
  month: string;
  status: AccountStatus;
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
  demo: "Demo Attended",
  proposal_sent: "Proposal Sent",
  trial: "Trial Started",
  rejected: "Rejected",
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
