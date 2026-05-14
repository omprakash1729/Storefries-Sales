import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tscbycveprcrrvvigzez.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzY2J5Y3ZlcHJjcnJ2dmlnemV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODI1NjUsImV4cCI6MjA5NDE1ODU2NX0.N2RF0lmrhvGIbqxPAJvx3W6HHOzMHWjoJhQ6fM9SSuE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("🔄 Testing Supabase Backend Connection...");
  
  try {
    // Check sales_reps
    const { data: reps, error: repsErr } = await supabase.from('sales_reps').select('*');
    if (repsErr) {
      console.error("❌ Error querying sales_reps:", repsErr);
    } else {
      console.log(`✅ Successfully connected! 'sales_reps' has ${reps.length} records.`);
    }

    // Check sales_accounts
    const { count, error: accErr } = await supabase
      .from('sales_accounts')
      .select('*', { count: 'exact', head: true });
    if (accErr) {
      console.error("❌ Error querying sales_accounts:", accErr);
    } else {
      console.log(`✅ Successfully connected! 'sales_accounts' has ${count} records.`);
    }
    
    // Try a simple select of one account
    const { data: recent, error: recentErr } = await supabase
      .from('sales_accounts')
      .select('id, name, created_at')
      .limit(1);
      
    if (recentErr) {
       console.error("❌ Error picking sample account:", recentErr);
    } else if (recent && recent.length > 0) {
       console.log("✅ Sample account retrieved:", recent[0]);
    } else {
       console.warn("⚠️ No records found in sales_accounts!");
    }

  } catch (e) {
    console.error("💥 Unexpected error:", e);
  }
}

check();
