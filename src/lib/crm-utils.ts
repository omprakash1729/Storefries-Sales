import type { Account } from "./types";

const MONTH_ORDER = [
  "Jan 2026",
  "Feb 2026",
  "March 2026",
  "Feb to March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026"
];

export function getMonthRank(month: string): number {
  const index = MONTH_ORDER.indexOf(month.trim());
  if (index !== -1) return index;
  
  // Fallback for custom months: try parsing year and month
  const match = month.match(/(\w+)\s+(\d{4})/);
  if (match) {
    const [_, mName, yName] = match;
    const yVal = parseInt(yName, 10);
    const mVal = MONTH_ORDER.findIndex(o => o.startsWith(mName));
    return yVal * 12 + (mVal !== -1 ? mVal : 0);
  }
  return 0;
}

export interface UniqueCompany {
  name: string;
  industry: string;
  mostRecent: Account;
  history: Account[];
}

export function groupAccountsByCompany(accounts: Account[]): UniqueCompany[] {
  const map = new Map<string, Account[]>();
  for (const a of accounts) {
    const key = a.name.trim().toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }

  const result: UniqueCompany[] = [];
  for (const [_, records] of map.entries()) {
    // Sort chronological: earliest first, latest last
    const sorted = [...records].sort((a, b) => {
      const diff = getMonthRank(a.month) - getMonthRank(b.month);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });

    const latestChronological = sorted[sorted.length - 1];
    let mostRecent = latestChronological;

    if (latestChronological.status !== "rejected") {
      const activeStatuses = ["new_lead", "prospect", "demo", "proposal_sent", "trial"];
      mostRecent = sorted.reduce((best, current) => {
        if (current.status === "rejected") return best;
        const currentRank = activeStatuses.indexOf(current.status);
        const bestRank = activeStatuses.indexOf(best.status);
        if (currentRank > bestRank) return current;
        if (currentRank === bestRank) {
          return getMonthRank(current.month) >= getMonthRank(best.month) ? current : best;
        }
        return best;
      }, sorted[0]);
    }

    result.push({
      name: mostRecent.name, // keep correct capitalization
      industry: mostRecent.industry,
      mostRecent,
      history: sorted
    });
  }

  return result;
}
