import { create } from "zustand";
import type { Account, SalesRep } from "./types";
import { SEED_ACCOUNTS, SEED_REPS } from "./seed-data";
import { supabase } from "./supabase";
import { toast } from "sonner";

interface State {
  accounts: Account[];
  reps: SalesRep[];
  globalMonths: string[];
  isLoading: boolean;
  isAuthenticated: boolean | null;
  
  fetchData: () => Promise<void>;
  subscribeRealtime: () => (() => void);

  addAccount: (a: Omit<Account, "id">) => Promise<void>;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addRep: (r: SalesRep) => Promise<void>;
  setGlobalMonths: (m: string[]) => void;
  setAuthenticated: (val: boolean) => void;
  resetData: () => void;
}

export const useStore = create<State>()((set, get) => ({
  accounts: SEED_ACCOUNTS,
  reps: SEED_REPS,
  globalMonths: [],
  isLoading: false,
  isAuthenticated: null,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [accountsRes, repsRes] = await Promise.all([
        supabase.from("sales_accounts").select("*").order("createdAt", { ascending: false }),
        supabase.from("sales_reps").select("*").order("name"),
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (repsRes.error) throw repsRes.error;

      const accounts = accountsRes.data as Account[];
      const reps = repsRes.data as SalesRep[];

      // Seamless Migration Logic:
      // If cloud database is perfectly fresh and completely empty, 
      // auto-provision it with your existing fallback seed data so you don't lose your demo dataset!
      if (accounts.length === 0 && reps.length === 0) {
        console.warn("⚡ Database is empty. Auto-initializing shared cloud storage with default seed dataset...");
        
        // Clean internal IDs off seeds so DB assigns final cloud identifiers
        const seedAccs = SEED_ACCOUNTS.map(({ id: _id, ...rest }) => rest);
        
        await Promise.all([
          supabase.from("sales_accounts").insert(seedAccs),
          supabase.from("sales_reps").insert(SEED_REPS)
        ]);
        
        // Recursive single run-thru to load freshly inserted rows back into cache
        const [accReload, repsReload] = await Promise.all([
          supabase.from("sales_accounts").select("*").order("createdAt", { ascending: false }),
          supabase.from("sales_reps").select("*").order("name"),
        ]);
        
        set({
          accounts: accReload.data as Account[],
          reps: repsReload.data?.length ? repsReload.data as SalesRep[] : SEED_REPS,
          isLoading: false
        });
        return;
      }

      // Successfully loaded live remote data
      set({ 
        accounts, 
        reps: reps.length ? reps : SEED_REPS,
        isLoading: false 
      });
      
    } catch (error: any) {
      // Fallback Safely: If table doesn't exist yet (user hasn't run SQL), 
      // we keep the UI running on fallback code instead of crashing.
      set({ isLoading: false });
      
      if (error.message?.includes("does not exist")) {
        console.log("ℹ️  Supabase tables not detected yet. Falling back to static mode.");
      } else {
        console.error("❌ Supabase network error:", error);
      }
    }
  },

  subscribeRealtime: () => {
    // Establish real-time listener channel
    const channel = supabase
      .channel("sales_dashboard_feed")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "sales_accounts" },
        () => {
          // Re-sync whenever ANY user modifies our primary data feed
          get().fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales_reps" },
        () => {
          get().fetchData();
        }
      )
      .subscribe();
      
    return () => {
      // teardown connection hook on unmount
      supabase.removeChannel(channel);
    };
  },

  addAccount: async (a) => {
    const tempId = `optimistic-${Math.random()}`;
    const optimisticAcc: Account = { ...a, id: tempId } as Account;

    // UI goes fast (Local Update)
    set((s) => ({
      accounts: [optimisticAcc, ...s.accounts],
    }));

    // Fire hose to Database
    const { data, error } = await supabase
      .from("sales_accounts")
      .insert(a)
      .select()
      .single();

    if (error) {
      toast.error("Cloud Sync failed: Account was not saved to database.");
      get().fetchData(); // Revert to truth
    } else {
      // Swap placeholder object with final persisted database response
      set((s) => ({
        accounts: s.accounts.map((acc) => (acc.id === tempId ? (data as Account) : acc)),
      }));
    }
  },

  updateAccount: async (id, patch) => {
    // Instant visual update
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

    const { error } = await supabase
      .from("sales_accounts")
      .update(patch)
      .eq("id", id);

    if (error) {
      console.error("Update failed:", error);
      toast.error("Failed to persist update to Cloud.");
      get().fetchData(); // Force pull clean snapshot 
    }
  },

  deleteAccount: async (id) => {
    // Optimistic deletion
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
    }));

    const { error } = await supabase
      .from("sales_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Could not delete from server.");
      get().fetchData();
    }
  },

  addRep: async (r) => {
    set((s) => ({ reps: [...s.reps, r] }));
    const { error } = await supabase.from("sales_reps").insert(r);
    if (error) {
      toast.error("Could not add rep to server.");
      get().fetchData();
    }
  },

  setGlobalMonths: (m) => set({ globalMonths: m }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  
  resetData: () => {
    // Purge local memory override back to seeds
    set({ accounts: SEED_ACCOUNTS, reps: SEED_REPS, globalMonths: [] });
  },
}));

export const useFilteredAccounts = () => {
  const { accounts, globalMonths } = useStore();
  return globalMonths.length === 0
    ? accounts
    : accounts.filter((a) => globalMonths.includes(a.month));
};
