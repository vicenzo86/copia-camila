import { createClient } from '@supabase/supabase-js';

// As credenciais do Supabase são carregadas a partir de variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação para garantir que as variáveis de ambiente foram carregadas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.");
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // A persistência da sessão é recomendada para a maioria das aplicações web.
    // Desabilitar (false) pode ser útil em cenários específicos como serverless,
    // mas para uma SPA padrão, o ideal é manter a sessão persistida.
    persistSession: true,
  }
});

