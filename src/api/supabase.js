import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "Variaveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY nao encontradas. " +
    "Copie .env.example para .env.local e preencha com os valores do seu projeto Supabase."
  );
}

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
