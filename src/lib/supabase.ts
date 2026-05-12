import { createClient } from "@supabase/supabase-js";
import type { Account, SalesRep } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase environment variables missing. Using simulated fallback client mode.");
}

// Use valid-format placeholder URI and generic key to prevent library crash during SSR/Build step
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co", 
  supabaseAnonKey || "placeholder-anon-key"
);

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
