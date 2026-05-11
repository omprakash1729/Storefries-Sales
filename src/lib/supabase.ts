import { createClient } from "@supabase/supabase-js";
import type { Account, SalesRep } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Ensure .env is configured.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

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
    };
  };
}
