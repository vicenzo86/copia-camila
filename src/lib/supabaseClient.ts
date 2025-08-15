import { createClient } from '@supabase/supabase-js';

// ✅ USAR as variáveis de ambiente (não hardcoded)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ REMOVER a configuração problemática
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
