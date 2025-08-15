import { createClient } from '@supabase/supabase-js';

// Credenciais atualizadas fornecidas pelo usuário
const supabaseUrl = "https://kjgfdmyauopdoxumvqxy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZ2ZkbXlhdW9wZG94dW12cXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDYzNjYsImV4cCI6MjA2MjY4MjM2Nn0.r2rw2USkNlFLFoZtqDJuyRWRmtCrzq1WVVB7_0fJxtI";

// Criação do cliente Supabase com tratamento de erro
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

