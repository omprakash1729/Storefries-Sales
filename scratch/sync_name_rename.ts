import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tscbycveprcrrvvigzez.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzY2J5Y3ZlcHJjcnJ2dmlnemV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODI1NjUsImV4cCI6MjA5NDE1ODU2NX0.N2RF0lmrhvGIbqxPAJvx3W6HHOzMHWjoJhQ6fM9SSuE";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("🔄 Updating user names remotely from 'Omprakash' to 'Om Prakash'...");
  
  const accResult = await supabase
    .from("sales_accounts")
    .update({ owner: "Om Prakash" })
    .eq("owner", "Omprakash");
    
  if (accResult.error) {
      console.error("Accounts update error:", accResult.error);
  } else {
      console.log("✅ Updated instances in sales_accounts.");
  }

  const repResult = await supabase
    .from("sales_reps")
    .update({ name: "Om Prakash" })
    .eq("name", "Omprakash");
    
  if (repResult.error) {
      console.error("Reps update error:", repResult.error);
  } else {
      console.log("✅ Updated instances in sales_reps.");
  }
  
  console.log("🏁 Name migration fully synced!");
}

run();
