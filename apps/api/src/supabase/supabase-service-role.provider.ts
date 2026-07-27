import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

function buildServiceRoleClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Único ponto do código com acesso à service_role key (ADR-0011).
 * Bypassa RLS — só usado onde a leitura/escrita não pode ser feita
 * pelo próprio usuário (ex.: purchase_receipts, gravação de entitlements).
 */
@Injectable()
export class SupabaseServiceRoleClient {
  readonly client: ReturnType<typeof buildServiceRoleClient>;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias',
      );
    }
    this.client = buildServiceRoleClient(url, serviceRoleKey);
  }
}
