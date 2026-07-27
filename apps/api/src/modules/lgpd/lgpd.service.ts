import { Injectable } from '@nestjs/common';
import type { DataExportResponse } from '@forja/schema';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';

@Injectable()
export class LgpdService {
  constructor(private readonly supabase: SupabaseServiceRoleClient) {}

  async exportarDados(userId: string): Promise<DataExportResponse> {
    const [
      diaryEvents,
      consentEvents,
      profile,
      entitlements,
      purchaseReceipts,
    ] = await Promise.all([
      this.supabase.client
        .from('diary_events')
        .select('*')
        .eq('user_id', userId),
      this.supabase.client
        .from('consent_events')
        .select('*')
        .eq('user_id', userId),
      this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(),
      this.supabase.client
        .from('entitlements')
        .select('*')
        .eq('user_id', userId),
      // purchase_receipts só é legível via service_role (zero política de RLS para authenticated) —
      // por isso o filtro por user_id é responsabilidade explícita deste código, não do banco.
      this.supabase.client
        .from('purchase_receipts')
        .select('*')
        .eq('user_id', userId),
    ]);

    return {
      diary_events: (diaryEvents.data ??
        []) as DataExportResponse['diary_events'],
      consent_events: (consentEvents.data ??
        []) as DataExportResponse['consent_events'],
      profile: (profile.data ?? null) as DataExportResponse['profile'],
      entitlements: (entitlements.data ??
        []) as DataExportResponse['entitlements'],
      purchase_receipts: (purchaseReceipts.data ??
        []) as DataExportResponse['purchase_receipts'],
    };
  }
}
