// ─── Supabase Client Configuration ──────────────────────────────────────────
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. " +
    "Database operations will fail. Check your .env file."
  );
}

const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "", {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
