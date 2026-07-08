import { createClient } from "@supabase/supabase-js";
import type { Account, SalesRep, BniContact, FranchiseConsultant } from "./types";

const supabaseUrl = (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined) || import.meta.env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : undefined) || import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Strong types for our tables database interface helper
export interface Database {
  public: {
    Tables: {
      sales_accounts: {
        Row: Account;
        Insert: Omit<Account, "id">;
        Update: Partial<Omit<Account, "id">>;
      };
      sales_reps: {
        Row: SalesRep;
        Insert: SalesRep;
        Update: Partial<SalesRep>;
      };
      bni_contacts: {
        Row: BniContact;
        Insert: Omit<BniContact, "id">;
        Update: Partial<Omit<BniContact, "id">>;
      };
      franchise_consultants: {
        Row: FranchiseConsultant;
        Insert: Omit<FranchiseConsultant, "id">;
        Update: Partial<Omit<FranchiseConsultant, "id">>;
      };
    };
  };
}
