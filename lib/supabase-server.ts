import { createClient } from '@supabase/supabase-js';

// Public sayfalar için (sadece okuma, RLS public politikaları geçerli)
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
