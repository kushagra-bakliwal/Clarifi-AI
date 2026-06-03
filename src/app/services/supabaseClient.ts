import { createClient } from '@supabase/supabase-js';

// Supabase project credentials loaded from environment variables.
// In development, set these in .env.local (never commit real keys to Git).
// The anon key is safe for client bundles — it only grants access through RLS policies.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
