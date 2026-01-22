
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  // Only throw in browser context or when actually trying to use it to prevent build errors if envs are missing
  if (typeof window !== "undefined") {
     console.warn("Supabase credentials missing! Check your .env.local file.");
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
