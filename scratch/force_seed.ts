import { createClient } from "@supabase/supabase-js";
import { SEED_ACCOUNTS, SEED_REPS } from "../src/lib/seed-data";

const supabaseUrl = "https://tscbycveprcrrvvigzez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzY2J5Y3ZlcHJjcnJ2dmlnemV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODI1NjUsImV4cCI6MjA5NDE1ODU2NX0.N2RF0lmrhvGIbqxPAJvx3W6HHOzMHWjoJhQ6fM9SSuE";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("🚀 Force-seeding dataset to new Supabase project...");
  
  // Clean IDs off seeds and inject createdAt if missing
  const cleanedAccounts = SEED_ACCOUNTS.map(({ id, ...rest }) => ({
      ...rest,
      createdAt: rest.createdAt || new Date().toISOString()
  }));
  
  const { error: accError } = await supabase.from("sales_accounts").insert(cleanedAccounts);
  if (accError) {
      console.error("Failed to seed accounts:", accError);
  } else {
      console.log(`✅ Successfully seeded ${cleanedAccounts.length} accounts!`);
  }
  
  console.log("🏁 Done.");
}

run();
