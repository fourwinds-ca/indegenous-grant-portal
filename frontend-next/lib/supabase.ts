import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a placeholder client during build time if env vars are missing
// The actual client will be initialized at runtime
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  });
} else {
  // During build time, create a mock client that won't throw
  // This allows static page generation to complete
  console.warn('Supabase environment variables not set. Using placeholder client.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
}

export { supabase };
