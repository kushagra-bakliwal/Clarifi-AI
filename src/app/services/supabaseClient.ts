import { createClient } from '@supabase/supabase-js';

// Supabase project credentials (public — safe to include in client bundle)
const supabaseUrl = 'https://ubkkyunvwsjhmbwpkgyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVia2t5dW52d3NqaG1id3BrZ3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDE2MjUsImV4cCI6MjA4NzYxNzYyNX0.EruJeUJsDAH2VVYjb0hgRhGsC0XtOsk2o1ugu-_WDeI';

export const supabase = createClient(supabaseUrl, supabaseKey);
