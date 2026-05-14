import { createClient } from "@supabase/supabase-js";
import type { Account, SalesRep } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
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
