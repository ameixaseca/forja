import { Inject, Injectable } from '@nestjs/common';
import { EntitlementPlatformSchema } from '@forja/schema';
import type { EntitlementValidateResponse } from '@forja/schema';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';
import { RECEIPT_VALIDATOR_REGISTRY } from './receipt-validator';
import type { ReceiptValidatorRegistry } from './receipt-validator';
import type { z } from 'zod';

type EntitlementPlatform = z.infer<typeof EntitlementPlatformSchema>;

const PLATFORM_PARA_ORIGEM: Record<EntitlementPlatform, string> = {
  ios: 'app_store',
  android: 'play_store',
  stripe: 'stripe',
};

@Injectable()
export class EntitlementsService {
  constructor(
    private readonly supabase: SupabaseServiceRoleClient,
    @Inject(RECEIPT_VALIDATOR_REGISTRY)
    private readonly validators: ReceiptValidatorRegistry,
  ) {}

  async validate(
    userId: string,
    platform: EntitlementPlatform,
    receipt: string,
  ): Promise<EntitlementValidateResponse> {
    const origem = PLATFORM_PARA_ORIGEM[platform];
    const resultado = await this.validators[platform].validate(receipt);

    // Sempre grava o recibo bruto primeiro: nenhuma concessão de acesso existe sem trilha de auditoria (ADR-0011).
    const { data: purchaseReceipt } = await this.supabase.client
      .from('purchase_receipts')
      .insert({
        user_id: userId,
        origem,
        payload_bruto: { receipt },
        status_verificacao: resultado.valid ? 'verificado' : 'falhou',
        verificado_em: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (!resultado.valid) {
      return { valid: false };
    }

    // upsert: revalidar o mesmo recibo (retry do cliente) não deve violar
    // entitlements_transacao_unica (origem, transacao_externa_id) nem duplicar o entitlement.
    const { data: entitlement } = await this.supabase.client
      .from('entitlements')
      .upsert(
        {
          user_id: userId,
          pacote: resultado.productId,
          origem,
          status: 'ativo',
          valido_ate: resultado.expiresAt ?? null,
          transacao_externa_id: receipt,
        },
        { onConflict: 'origem,transacao_externa_id' },
      )
      .select('id')
      .single();

    if (entitlement?.id && purchaseReceipt?.id) {
      const entitlementId = entitlement.id as string;
      const purchaseReceiptId = purchaseReceipt.id as string;
      await this.supabase.client
        .from('purchase_receipts')
        .update({ entitlement_id: entitlementId })
        .eq('id', purchaseReceiptId);
    }

    return {
      valid: true,
      product_id: resultado.productId,
      expires_at: resultado.expiresAt ?? null,
    };
  }
}
