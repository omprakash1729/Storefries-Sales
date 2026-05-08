import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Account, SalesRep } from "./types";
import { SEED_ACCOUNTS, SEED_REPS } from "./seed-data";

interface State {
  accounts: Account[];
  reps: SalesRep[];
  globalMonth: string; // "all" or specific month
  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addRep: (r: SalesRep) => void;
  setGlobalMonth: (m: string) => void;
  resetData: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      accounts: SEED_ACCOUNTS,
      reps: SEED_REPS,
      globalMonth: "all",
      addAccount: (a) =>
        set((s) => ({
          accounts: [
            { ...a, id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
            ...s.accounts,
          ],
        })),
      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      deleteAccount: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),
      addRep: (r) => set((s) => ({ reps: [...s.reps, r] })),
      setGlobalMonth: (m) => set({ globalMonth: m }),
      resetData: () =>
        set({ accounts: SEED_ACCOUNTS, reps: SEED_REPS, globalMonth: "all" }),
    }),
    { name: "storefries-sales-store" }
  )
);

export const useFilteredAccounts = () => {
  const { accounts, globalMonth } = useStore();
  return globalMonth === "all"
    ? accounts
    : accounts.filter((a) => a.month === globalMonth);
};
