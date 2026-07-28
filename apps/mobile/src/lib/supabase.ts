import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Sessão é a do Supabase Auth (magic link) — a API NestJS não emite JWT
 * próprio (ADR-0011). `diary_events`/`consent_events` são lidos/gravados
 * direto por este client, sob RLS (`auth.uid()`).
 *
 * React Native não tem `window.localStorage` (o storage padrão do
 * supabase-js): sem um adapter explícito, `persistSession` não persiste
 * nada de verdade e o usuário perde a sessão a cada restart do app.
 * `detectSessionInUrl: false` porque não há URL de redirect em RN.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
