import { supabase } from "./src/lib/supabase";
import { SEED_ACCOUNTS } from "./src/lib/seed-data";

async function run() {
  console.log("Fetching existing accounts from Supabase...");
  const { data: existing, error: fetchErr } = await supabase
    .from("sales_accounts")
    .select("createdAt");

  if (fetchErr) {
    console.error("Error fetching accounts:", fetchErr);
    return;
  }

  const existingDates = new Set(existing?.map((a) => a.createdAt));

  // Find accounts not in the DB, and ensure createdAt is defined
  const toInsert = SEED_ACCOUNTS.filter(
    (a) => !!a.createdAt && !existingDates.has(a.createdAt),
  ).map(({ id, ...rest }) => ({
    ...rest,
    createdAt: rest.createdAt || new Date().toISOString(),
  }));

  if (toInsert.length === 0) {
    console.log("No new accounts to insert.");
    return;
  }

  console.log(`Inserting ${toInsert.length} new accounts...`);
  const { error: insertErr } = await supabase.from("sales_accounts").insert(toInsert);

  if (insertErr) {
    console.error("Error inserting accounts:", insertErr);
    console.error("First failing item example:", toInsert[0]);
  } else {
    console.log("Successfully inserted new accounts!");
  }
}

run();
