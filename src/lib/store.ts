import { create } from "zustand";
import type { Account, SalesRep, AccountContact, BniContact, FranchiseConsultant } from "./types";
import { SEED_ACCOUNTS, SEED_REPS } from "./seed-data";
import { supabase } from "./supabase";
import { toast } from "sonner";

const getMergedAccounts = (accounts: Account[]): Account[] => {
  if (typeof window === "undefined") return accounts;
  try {
    const localRemindersRaw = localStorage.getItem("storefries_reminders") || "{}";
    const localReminders = JSON.parse(localRemindersRaw);
    return accounts.map((acc) => {
      const local = localReminders[acc.id];
      if (local) {
        return {
          ...acc,
          reminderType: acc.reminderType !== undefined ? acc.reminderType : local.reminderType,
          reminderDate: acc.reminderDate !== undefined ? acc.reminderDate : local.reminderDate,
          reminderClosed:
            acc.reminderClosed !== undefined ? acc.reminderClosed : local.reminderClosed,
        };
      }
      return acc;
    });
  } catch (e) {
    console.error("Error reading reminders from local storage", e);
    return accounts;
  }
};

const promoteToSalesAccountIfNeeded = async (
  company: string | undefined,
  owner: string,
  contactName: string,
  source: "BNI" | "Franchise",
  get: any,
) => {
  if (!company) return;
  const accounts = get.accounts;
  const exists = accounts.some((acc: any) => acc.name.toLowerCase() === company.toLowerCase());
  if (!exists) {
    await get.addAccount({
      name: company,
      owner: owner,
      industry: "Other",
      month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
      status: "demo",
      reason: `Auto-promoted from ${source} Contact demo booking (${contactName})`,
      createdAt: new Date().toISOString(),
      followUpCount: 1,
    });
    toast.success(`Automatically created Sales Account for "${company}"!`);
  }
};

interface State {
  accounts: Account[];
  reps: SalesRep[];
  contacts: AccountContact[];
  bniContacts: BniContact[];
  franchiseConsultants: FranchiseConsultant[];
  globalMonths: string[];
  isLoading: boolean;
  isAuthenticated: boolean | null;
  activeCompanyTimeline: string | null;

  fetchData: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  fetchBniContacts: () => Promise<void>;
  fetchFranchiseConsultants: () => Promise<void>;
  subscribeRealtime: () => () => void;

  addAccount: (a: Omit<Account, "id">) => Promise<void>;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addRep: (r: SalesRep) => Promise<void>;
  addContact: (c: Omit<AccountContact, "id">) => Promise<void>;
  updateContact: (id: string, patch: Partial<AccountContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  importContacts: (contactsList: Omit<AccountContact, "id">[]) => Promise<void>;

  addBniContact: (c: Omit<BniContact, "id">) => Promise<void>;
  updateBniContact: (id: string, patch: Partial<BniContact>) => Promise<void>;
  deleteBniContact: (id: string) => Promise<void>;
  importBniContacts: (list: Omit<BniContact, "id">[]) => Promise<void>;

  addFranchiseConsultant: (c: Omit<FranchiseConsultant, "id">) => Promise<void>;
  updateFranchiseConsultant: (id: string, patch: Partial<FranchiseConsultant>) => Promise<void>;
  deleteFranchiseConsultant: (id: string) => Promise<void>;
  importFranchiseConsultants: (list: Omit<FranchiseConsultant, "id">[]) => Promise<void>;

  setGlobalMonths: (m: string[]) => void;
  setAuthenticated: (val: boolean) => void;
  setActiveCompanyTimeline: (name: string | null) => void;
  resetData: () => void;
}

export const useStore = create<State>()((set, get) => ({
  accounts: getMergedAccounts(SEED_ACCOUNTS),
  reps: SEED_REPS,
  contacts: [],
  bniContacts: [],
  franchiseConsultants: [],
  globalMonths: [],
  isLoading: false,
  isAuthenticated: null,
  activeCompanyTimeline: null,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      let allAccounts: Account[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from("sales_accounts")
          .select("*")
          .order("createdAt", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        if (data) {
          allAccounts.push(...data);
          if (data.length < pageSize) break;
        } else {
          break;
        }
        page++;
      }

      const repsRes = await supabase.from("sales_reps").select("*").order("name");
      if (repsRes.error) throw repsRes.error;

      const accounts = allAccounts;
      const reps = repsRes.data as SalesRep[];

      // Seamless Migration Logic:
      // If cloud database is perfectly fresh and completely empty,
      // auto-provision it with your existing fallback seed data so you don't lose your demo dataset!
      if (accounts.length === 0 && reps.length === 0) {
        console.warn(
          "⚡ Database is empty. Auto-initializing shared cloud storage with default seed dataset...",
        );

        // Clean internal IDs off seeds so DB assigns final cloud identifiers
        const seedAccs = SEED_ACCOUNTS.map(({ id: _id, ...rest }) => rest);

        await Promise.all([
          supabase.from("sales_accounts").insert(seedAccs),
          supabase.from("sales_reps").insert(SEED_REPS),
        ]);

        // Recursive single run-thru to load freshly inserted rows back into cache
        const [accReload, repsReload] = await Promise.all([
          supabase.from("sales_accounts").select("*").order("createdAt", { ascending: false }),
          supabase.from("sales_reps").select("*").order("name"),
        ]);

        set({
          accounts: getMergedAccounts(accReload.data as Account[]),
          reps: repsReload.data?.length ? (repsReload.data as SalesRep[]) : SEED_REPS,
          isLoading: false,
        });
        return;
      }

      // Successfully loaded live remote data
      set({
        accounts: getMergedAccounts(accounts),
        reps: reps.length ? reps : SEED_REPS,
        isLoading: false,
      });
    } catch (error: any) {
      // Fallback Safely: If table doesn't exist yet (user hasn't run SQL),
      // we keep the UI running on fallback code instead of crashing.
      set({ isLoading: false });

      if (error.message?.includes("does not exist")) {
        console.log("ℹ️  Supabase tables not detected yet. Falling back to static mode.");
        set({ accounts: getMergedAccounts(get().accounts) });
      } else {
        console.error("❌ Supabase network error:", error);
      }
    }
  },

  fetchContacts: async () => {
    try {
      const { data, error } = await supabase
        .from("account_contacts")
        .select("*")
        .order("createdAt", { ascending: true });
      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist yet — run the migration SQL in Supabase
          console.warn("account_contacts table not found. Run the migration SQL.");
        } else {
          console.error("fetchContacts error:", error);
        }
        return;
      }
      set({ contacts: (data ?? []) as AccountContact[] });
    } catch (e) {
      console.error("fetchContacts exception:", e);
    }
  },

  subscribeRealtime: () => {
    // Fetch contacts immediately on subscription start
    get().fetchContacts();
    get().fetchBniContacts();
    get().fetchFranchiseConsultants();

    // Establish real-time listener channel
    const channel = supabase
      .channel("sales_dashboard_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_accounts" }, () => {
        // Re-sync whenever ANY user modifies our primary data feed
        get().fetchData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_reps" }, () => {
        get().fetchData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "account_contacts" }, () => {
        get().fetchContacts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bni_contacts" }, () => {
        get().fetchBniContacts();
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "franchise_consultants" },
        () => {
          get().fetchFranchiseConsultants();
        },
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

    const reminderFields = {
      reminderType: a.reminderType,
      reminderDate: a.reminderDate,
      reminderClosed: a.reminderClosed,
    };

    let payload = { ...a };

    // Fire hose to Database
    let { data, error } = await supabase.from("sales_accounts").insert(payload).select().single();

    if (error && error.code === "42703") {
      // Strip reminder fields and retry
      const cleanPayload = { ...payload };
      delete cleanPayload.reminderType;
      delete cleanPayload.reminderDate;
      delete cleanPayload.reminderClosed;

      const retry = await supabase.from("sales_accounts").insert(cleanPayload).select().single();

      data = retry.data;
      error = retry.error;

      if (!error && data) {
        // Save reminder fields to local storage under the newly generated ID
        try {
          const localRemindersRaw = localStorage.getItem("storefries_reminders") || "{}";
          const localReminders = JSON.parse(localRemindersRaw);
          localReminders[data.id] = reminderFields;
          localStorage.setItem("storefries_reminders", JSON.stringify(localReminders));
        } catch (e) {
          console.error("LocalStorage write failed:", e);
        }
      }
    } else if (
      !error &&
      data &&
      (reminderFields.reminderType ||
        reminderFields.reminderDate ||
        reminderFields.reminderClosed !== undefined)
    ) {
      try {
        const localRemindersRaw = localStorage.getItem("storefries_reminders") || "{}";
        const localReminders = JSON.parse(localRemindersRaw);
        localReminders[data.id] = reminderFields;
        localStorage.setItem("storefries_reminders", JSON.stringify(localReminders));
      } catch (e) {
        console.error("LocalStorage write failed:", e);
      }
    }

    if (error) {
      toast.error("Cloud Sync failed: Account was not saved to database.");
      get().fetchData(); // Revert to truth
    } else {
      // Swap placeholder object with final persisted database response
      const dbAcc = data as Account;
      const mergedAcc: Account = {
        ...dbAcc,
        reminderType:
          dbAcc.reminderType !== undefined ? dbAcc.reminderType : reminderFields.reminderType,
        reminderDate:
          dbAcc.reminderDate !== undefined ? dbAcc.reminderDate : reminderFields.reminderDate,
        reminderClosed:
          dbAcc.reminderClosed !== undefined ? dbAcc.reminderClosed : reminderFields.reminderClosed,
      };
      set((s) => ({
        accounts: s.accounts.map((acc) => (acc.id === tempId ? mergedAcc : acc)),
      }));
    }
  },

  updateAccount: async (id, patch) => {
    // Instant visual update
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

    const reminderFields = ["reminderType", "reminderDate", "reminderClosed"];
    const hasReminderFields = reminderFields.some((k) => k in patch);

    if (hasReminderFields) {
      try {
        const localRemindersRaw = localStorage.getItem("storefries_reminders") || "{}";
        const localReminders = JSON.parse(localRemindersRaw);
        const existing = localReminders[id] || {};
        localReminders[id] = {
          reminderType:
            patch.reminderType !== undefined ? patch.reminderType : existing.reminderType,
          reminderDate:
            patch.reminderDate !== undefined ? patch.reminderDate : existing.reminderDate,
          reminderClosed:
            patch.reminderClosed !== undefined ? patch.reminderClosed : existing.reminderClosed,
        };
        localStorage.setItem("storefries_reminders", JSON.stringify(localReminders));
      } catch (e) {
        console.error("LocalStorage update failed:", e);
      }
    }

    const { error } = await supabase.from("sales_accounts").update(patch).eq("id", id);

    if (error) {
      if (error.code === "42703") {
        // Strip reminder fields and retry
        const cleanPatch = { ...patch };
        delete cleanPatch.reminderType;
        delete cleanPatch.reminderDate;
        delete cleanPatch.reminderClosed;

        if (Object.keys(cleanPatch).length > 0) {
          const { error: retryError } = await supabase
            .from("sales_accounts")
            .update(cleanPatch)
            .eq("id", id);

          if (retryError) {
            console.error("Retry update failed:", retryError);
            toast.error("Failed to persist update to Cloud.");
            get().fetchData();
          }
        }
      } else {
        console.error("Update failed:", error);
        toast.error("Failed to persist update to Cloud.");
        get().fetchData(); // Force pull clean snapshot
      }
    }
  },

  deleteAccount: async (id) => {
    // Optimistic deletion
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
    }));

    // Clean up local storage reminder for this account if it exists
    try {
      const localRemindersRaw = localStorage.getItem("storefries_reminders") || "{}";
      const localReminders = JSON.parse(localRemindersRaw);
      if (localReminders[id]) {
        delete localReminders[id];
        localStorage.setItem("storefries_reminders", JSON.stringify(localReminders));
      }
    } catch (e) {
      console.error(e);
    }

    const { error } = await supabase.from("sales_accounts").delete().eq("id", id);

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

  addContact: async (c) => {
    const tempId = `optimistic-contact-${Math.random()}`;
    const optimistic: AccountContact = { ...c, id: tempId };
    set((s) => ({ contacts: [...s.contacts, optimistic] }));

    const { data, error } = await supabase.from("account_contacts").insert(c).select().single();

    if (error) {
      toast.error("Failed to save contact.");
      set((s) => ({ contacts: s.contacts.filter((x) => x.id !== tempId) }));
    } else {
      set((s) => ({
        contacts: s.contacts.map((x) => (x.id === tempId ? (data as AccountContact) : x)),
      }));
    }
  },

  updateContact: async (id, patch) => {
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    const { error } = await supabase.from("account_contacts").update(patch).eq("id", id);
    if (error) {
      toast.error("Failed to update contact.");
      get().fetchContacts();
    }
  },

  deleteContact: async (id) => {
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
    const { error } = await supabase.from("account_contacts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete contact.");
      get().fetchContacts();
    }
  },

  importContacts: async (contactsList) => {
    set({ isLoading: true });
    try {
      const { accounts, reps } = get();

      // Find unique company names from the imported list that do not exist yet (case-insensitive)
      const existingNames = new Set(accounts.map((a) => a.name.toLowerCase()));
      const missingAccountNames = Array.from(
        new Set(
          contactsList
            .map((c) => c.accountName.trim())
            .filter((name) => name && !existingNames.has(name.toLowerCase())),
        ),
      );

      // Bulk create missing accounts first
      if (missingAccountNames.length > 0) {
        const newAccounts = missingAccountNames.map((name) => ({
          name,
          industry: "Other",
          owner: reps[0]?.name || "Bhuvaneshwari",
          status: "new_lead" as const,
          month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
          createdAt: new Date().toISOString(),
          followUpCount: 0,
        }));

        const { error: accError } = await supabase.from("sales_accounts").insert(newAccounts);

        if (accError) throw accError;
      }

      // Bulk insert contacts
      const { error: contactsError } = await supabase.from("account_contacts").insert(contactsList);

      if (contactsError) throw contactsError;

      toast.success(`Successfully imported ${contactsList.length} contacts!`);

      // Refresh data feed
      await Promise.all([get().fetchData(), get().fetchContacts()]);
    } catch (err: any) {
      console.error("Bulk import error:", err);
      toast.error(err.message || "Failed to import contacts.");
    } finally {
      set({ isLoading: false });
    }
  },

  setGlobalMonths: (m) => set({ globalMonths: m }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  setActiveCompanyTimeline: (name) => set({ activeCompanyTimeline: name }),

  fetchBniContacts: async () => {
    try {
      const { data, error } = await supabase
        .from("bni_contacts")
        .select("*")
        .order("createdAt", { ascending: false });
      if (error) {
        console.error("fetchBniContacts error:", error);
        return;
      }

      const list = (data ?? []) as BniContact[];

      if (list.length === 0) {
        const initialSeeds = [
          {
            name: "Santosh Patil",
            company: "Formec Media LLP",
            designation: "Digital/Advertising",
            bniChapter: "BNI Bhoomi",
            status: "replied" as const,
            medium: "Call" as const,
            owner: "Om Prakash",
            remark: "He will share his timing for meeting on 06/06/2026",
          },
          {
            name: "Manisha",
            company: "Enlight Web Services",
            designation: "Member",
            bniChapter: "BNI Solitaire",
            status: "demo_booked" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark:
              "Further Discussion - Venkat Sir need to send Whatsapp message to Manisha. She asked for a recorded video",
          },
          {
            name: "Zero4Studio Contact",
            company: "Zero4Studio",
            designation: "Member",
            bniChapter: "BNI Harmony",
            status: "demo_booked" as const,
            medium: "Call" as const,
            owner: "Om Prakash",
            remark: "Follow back with him 05.06.2026",
          },
        ];

        await supabase.from("bni_contacts").insert(initialSeeds);

        const reload = await supabase
          .from("bni_contacts")
          .select("*")
          .order("createdAt", { ascending: false });

        set({ bniContacts: (reload.data ?? []) as BniContact[] });
        return;
      }

      set({ bniContacts: list });
    } catch (e) {
      console.error("fetchBniContacts exception:", e);
    }
  },

  fetchFranchiseConsultants: async () => {
    try {
      const { data, error } = await supabase
        .from("franchise_consultants")
        .select("*")
        .order("createdAt", { ascending: false });
      if (error) {
        console.error("fetchFranchiseConsultants error:", error);
        return;
      }

      const list = (data ?? []) as FranchiseConsultant[];

      if (list.length === 0) {
        const initialSeeds = [
          {
            name: "Arshi Khan",
            company: "Self",
            designation: "Franchise consultant",
            phone: "917415599049",
            linkedin: "https://www.linkedin.com/in/arshi-khan-2abb911a2/",
            status: "replied" as const,
            medium: "Call" as const,
            owner: "Om Prakash",
            remark:
              "Call Outreach: Attended - Send pitch through Whatsapp. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]",
          },
          {
            name: "Javeed A. Khan",
            company: "Self",
            designation: "Franchise consultant",
            phone: "917619688070",
            linkedin: "https://www.linkedin.com/in/javeedahamedkhan/",
            status: "replied" as const,
            medium: "Call" as const,
            owner: "Om Prakash",
            remark:
              "Call Outreach: Attended - Send pitch through Whatsapp. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]",
          },
          {
            name: "Sumanth shetty",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919900701201",
            linkedin: "https://www.linkedin.com/in/sumanth-shetty-70905a148/",
            status: "reached_out" as const,
            medium: "Call" as const,
            owner: "Om Prakash",
            remark:
              "Call Outreach: Didn't pick the call. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]",
          },
          {
            name: "Vimal V",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919946557100",
            linkedin: "https://www.linkedin.com/in/vimalv1/",
            status: "replied" as const,
            medium: "Call" as const,
            owner: "Om Prakash",
            remark:
              "Call Outreach: Attended - Send pitch through Whatsapp. [Log: WhatsApp outreach before Call: Message Sent, Not Replied, Not Attended]",
          },
          {
            name: "Priyanka Panchal",
            company: "Self",
            designation: "Franchise consultant",
            phone: "918140038080",
            linkedin: "https://www.linkedin.com/in/priyanka-panchal-3a9b94232/",
            status: "replied" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Replied - Not Attended",
          },
          {
            name: "Amar Lunia",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919035027699",
            linkedin: "https://www.linkedin.com/in/amar-lunia-058273121/",
            status: "reached_out" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Not Replied - Not Attended",
          },
          {
            name: "Nilesh khatod",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919161225877",
            linkedin: "https://www.linkedin.com/in/nilesh-khatod-715145b1/",
            status: "replied" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Replied - Scheduled demo",
          },
          {
            name: "Kishin Thakur",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919930384641",
            linkedin: "https://www.linkedin.com/in/kishinthakur/",
            status: "demo_booked" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Replied - Attended",
          },
          {
            name: "Vijayasaradhi Kolasani",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919100094361",
            linkedin: "https://www.linkedin.com/in/vijayasaradhi-kolasani-71421325/",
            status: "replied" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Replied - Not Attended",
          },
          {
            name: "Anupam Srivastava",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919819523666",
            linkedin: "https://www.linkedin.com/in/chefanupamsrivastava/",
            status: "replied" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Replied - Not Attended",
          },
          {
            name: "Ravikumar Chandrashekar",
            company: "Self",
            designation: "Franchise consultant",
            phone: "919847012317",
            linkedin: "https://www.linkedin.com/in/raavikumaar/",
            status: "demo_booked" as const,
            medium: "WhatsApp" as const,
            owner: "Om Prakash",
            remark: "WhatsApp Outreach: Message Sent - Replied - Attended",
          },
        ];

        await supabase.from("franchise_consultants").insert(initialSeeds);

        const reload = await supabase
          .from("franchise_consultants")
          .select("*")
          .order("createdAt", { ascending: false });

        set({ franchiseConsultants: (reload.data ?? []) as FranchiseConsultant[] });
        return;
      }

      set({ franchiseConsultants: list });
    } catch (e) {
      console.error("fetchFranchiseConsultants exception:", e);
    }
  },

  addBniContact: async (c) => {
    const tempId = `optimistic-bni-${Math.random()}`;
    const optimistic: BniContact = { ...c, id: tempId } as BniContact;
    set((s) => ({ bniContacts: [optimistic, ...s.bniContacts] }));

    const { data, error } = await supabase.from("bni_contacts").insert(c).select().single();

    if (error) {
      toast.error("Failed to save BNI contact.");
      set((s) => ({ bniContacts: s.bniContacts.filter((x) => x.id !== tempId) }));
    } else {
      set((s) => ({
        bniContacts: s.bniContacts.map((x) => (x.id === tempId ? (data as BniContact) : x)),
      }));
      if (c.status === "demo_booked") {
        await promoteToSalesAccountIfNeeded(c.company, c.owner, c.name, "BNI", get());
      }
    }
  },

  updateBniContact: async (id, patch) => {
    set((s) => ({
      bniContacts: s.bniContacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    const { error } = await supabase.from("bni_contacts").update(patch).eq("id", id);
    if (error) {
      toast.error("Failed to update BNI contact.");
      get().fetchBniContacts();
    } else if (patch.status === "demo_booked") {
      const contact = get().bniContacts.find((c) => c.id === id);
      if (contact) {
        await promoteToSalesAccountIfNeeded(
          contact.company,
          contact.owner,
          contact.name,
          "BNI",
          get(),
        );
      }
    }
  },

  deleteBniContact: async (id) => {
    set((s) => ({ bniContacts: s.bniContacts.filter((c) => c.id !== id) }));
    const { error } = await supabase.from("bni_contacts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete BNI contact.");
      get().fetchBniContacts();
    }
  },

  importBniContacts: async (list) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("bni_contacts").insert(list);
      if (error) throw error;
      toast.success(`Successfully imported ${list.length} BNI contacts!`);
      await get().fetchBniContacts();
    } catch (err: any) {
      console.error("Bulk BNI import error:", err);
      toast.error(err.message || "Failed to import BNI contacts.");
    } finally {
      set({ isLoading: false });
    }
  },

  addFranchiseConsultant: async (c) => {
    const tempId = `optimistic-franchise-${Math.random()}`;
    const optimistic: FranchiseConsultant = { ...c, id: tempId } as FranchiseConsultant;
    set((s) => ({ franchiseConsultants: [optimistic, ...s.franchiseConsultants] }));

    const { data, error } = await supabase
      .from("franchise_consultants")
      .insert(c)
      .select()
      .single();

    if (error) {
      toast.error("Failed to save Franchise Consultant.");
      set((s) => ({ franchiseConsultants: s.franchiseConsultants.filter((x) => x.id !== tempId) }));
    } else {
      set((s) => ({
        franchiseConsultants: s.franchiseConsultants.map((x) =>
          x.id === tempId ? (data as FranchiseConsultant) : x,
        ),
      }));
      if (c.status === "demo_booked") {
        await promoteToSalesAccountIfNeeded(c.company, c.owner, c.name, "Franchise", get());
      }
    }
  },

  updateFranchiseConsultant: async (id, patch) => {
    set((s) => ({
      franchiseConsultants: s.franchiseConsultants.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }));
    const { error } = await supabase.from("franchise_consultants").update(patch).eq("id", id);
    if (error) {
      toast.error("Failed to update Franchise Consultant.");
      get().fetchFranchiseConsultants();
    } else if (patch.status === "demo_booked") {
      const contact = get().franchiseConsultants.find((c) => c.id === id);
      if (contact) {
        await promoteToSalesAccountIfNeeded(
          contact.company,
          contact.owner,
          contact.name,
          "Franchise",
          get(),
        );
      }
    }
  },

  deleteFranchiseConsultant: async (id) => {
    set((s) => ({ franchiseConsultants: s.franchiseConsultants.filter((c) => c.id !== id) }));
    const { error } = await supabase.from("franchise_consultants").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete Franchise Consultant.");
      get().fetchFranchiseConsultants();
    }
  },

  importFranchiseConsultants: async (list) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("franchise_consultants").insert(list);
      if (error) throw error;
      toast.success(`Successfully imported ${list.length} Franchise Consultants!`);
      await get().fetchFranchiseConsultants();
    } catch (err: any) {
      console.error("Bulk Franchise import error:", err);
      toast.error(err.message || "Failed to import Franchise Consultants.");
    } finally {
      set({ isLoading: false });
    }
  },

  resetData: () => {
    // Purge local memory override back to seeds
    set({
      accounts: getMergedAccounts(SEED_ACCOUNTS),
      reps: SEED_REPS,
      contacts: [],
      bniContacts: [],
      franchiseConsultants: [],
      globalMonths: [],
    });
  },
}));

export const useFilteredAccounts = () => {
  const { accounts, globalMonths } = useStore();
  return globalMonths.length === 0
    ? accounts
    : accounts.filter((a) => globalMonths.includes(a.month));
};
