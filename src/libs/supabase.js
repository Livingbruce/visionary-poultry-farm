
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL is missing. Check your .env file.'
  );
} else if (!supabaseKey) {
  throw new Error (
    'Supabase Anon Key is missing.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);