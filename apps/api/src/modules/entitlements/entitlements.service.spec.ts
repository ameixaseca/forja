import { EntitlementsService } from './entitlements.service';
import { SupabaseServiceRoleClient } from '../../supabase/supabase-service-role.provider';
import type {
  ReceiptValidationResult,
  ReceiptValidatorRegistry,
} from './receipt-validator';

function makeSupabaseStub(options: {
  purchaseReceiptRow: { id: string } | null;
  entitlementRow: { id: string } | null;
}) {
  const insertSingle = jest
    .fn()
    .mockResolvedValue({ data: options.purchaseReceiptRow });
  const insertSelect = jest.fn().mockReturnValue({ single: insertSingle });
  const insert = jest.fn().mockReturnValue({ select: insertSelect });

  const upsertSingle = jest
    .fn()
    .mockResolvedValue({ data: options.entitlementRow });
  const upsertSelect = jest.fn().mockReturnValue({ single: upsertSingle });
  const upsert = jest.fn().mockReturnValue({ select: upsertSelect });

  const updateEq = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn().mockReturnValue({ eq: updateEq });

  const from = jest.fn((table: string) => {
    if (table === 'purchase_receipts') {
      return { insert, update };
    }
    if (table === 'entitlements') {
      return { upsert };
    }
    throw new Error(`tabela inesperada nos testes: ${table}`);
  });

  const supabase = { client: { from } } as unknown as SupabaseServiceRoleClient;
  return {
    supabase,
    insert,
    insertSelect,
    upsert,
    upsertSelect,
    update,
    updateEq,
  };
}

function makeValidatorsStub(result: ReceiptValidationResult) {
  const validate = jest.fn().mockResolvedValue(result);
  const registry: ReceiptValidatorRegistry = {
    ios: { validate },
    android: { validate },
    stripe: { validate },
  };
  return { registry, validate };
}

describe('EntitlementsService', () => {
  it('recibo válido: grava purchase_receipts, depois entitlements, e vincula entitlement_id', async () => {
    const {
      supabase,
      insert,
      insertSelect,
      upsert,
      upsertSelect,
      update,
      updateEq,
    } = makeSupabaseStub({
      purchaseReceiptRow: { id: 'recibo-1' },
      entitlementRow: { id: 'entitlement-1' },
    });
    const { registry } = makeValidatorsStub({
      valid: true,
      productId: 'forja_campaign_espinha',
      expiresAt: null,
    });
    const service = new EntitlementsService(supabase, registry);

    const resposta = await service.validate('user-1', 'ios', 'recibo-base64');

    expect(resposta).toEqual({
      valid: true,
      product_id: 'forja_campaign_espinha',
      expires_at: null,
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        origem: 'app_store',
        status_verificacao: 'verificado',
        payload_bruto: { receipt: 'recibo-base64' },
      }),
    );
    expect(insertSelect).toHaveBeenCalledWith('id');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        pacote: 'forja_campaign_espinha',
        origem: 'app_store',
        status: 'ativo',
        transacao_externa_id: 'recibo-base64',
      }),
      { onConflict: 'origem,transacao_externa_id' },
    );
    expect(upsertSelect).toHaveBeenCalledWith('id');
    expect(update).toHaveBeenCalledWith({ entitlement_id: 'entitlement-1' });
    expect(updateEq).toHaveBeenCalledWith('id', 'recibo-1');
  });

  it('recibo válido com data de expiração: propaga expiresAt em vez de null', async () => {
    const { supabase, upsert } = makeSupabaseStub({
      purchaseReceiptRow: { id: 'recibo-exp' },
      entitlementRow: { id: 'entitlement-exp' },
    });
    const { registry } = makeValidatorsStub({
      valid: true,
      productId: 'forja_campaign_espinha',
      expiresAt: '2027-01-01T00:00:00.000Z',
    });
    const service = new EntitlementsService(supabase, registry);

    const resposta = await service.validate('user-1', 'ios', 'recibo-anual');

    expect(resposta).toEqual({
      valid: true,
      product_id: 'forja_campaign_espinha',
      expires_at: '2027-01-01T00:00:00.000Z',
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ valido_ate: '2027-01-01T00:00:00.000Z' }),
      { onConflict: 'origem,transacao_externa_id' },
    );
  });

  it('recibo válido mas upsert de entitlement não retorna linha: não tenta vincular purchase_receipts', async () => {
    const { supabase, update } = makeSupabaseStub({
      purchaseReceiptRow: { id: 'recibo-sem-vinculo' },
      entitlementRow: null,
    });
    const { registry } = makeValidatorsStub({
      valid: true,
      productId: 'pacote',
      expiresAt: null,
    });
    const service = new EntitlementsService(supabase, registry);

    await service.validate('user-1', 'ios', 'recibo-x');

    expect(update).not.toHaveBeenCalled();
  });

  it('recibo válido mas insert de purchase_receipts não retorna linha: não tenta vincular', async () => {
    const { supabase, update } = makeSupabaseStub({
      purchaseReceiptRow: null,
      entitlementRow: { id: 'entitlement-sem-recibo' },
    });
    const { registry } = makeValidatorsStub({
      valid: true,
      productId: 'pacote',
      expiresAt: null,
    });
    const service = new EntitlementsService(supabase, registry);

    await service.validate('user-1', 'ios', 'recibo-y');

    expect(update).not.toHaveBeenCalled();
  });

  it('recibo inválido: grava purchase_receipts como falhou e NÃO grava entitlement', async () => {
    const { supabase, insert, upsert } = makeSupabaseStub({
      purchaseReceiptRow: { id: 'recibo-2' },
      entitlementRow: null,
    });
    const { registry } = makeValidatorsStub({ valid: false });
    const service = new EntitlementsService(supabase, registry);

    const resposta = await service.validate(
      'user-1',
      'android',
      'recibo-invalido',
    );

    expect(resposta).toEqual({ valid: false });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        status_verificacao: 'falhou',
        origem: 'play_store',
      }),
    );
    expect(upsert).not.toHaveBeenCalled();
  });

  it('grava o recibo antes de decidir sobre o entitlement (ordem de gravação)', async () => {
    const chamadas: string[] = [];
    const { supabase, insert, upsert } = makeSupabaseStub({
      purchaseReceiptRow: { id: 'recibo-3' },
      entitlementRow: { id: 'entitlement-3' },
    });
    insert.mockImplementation(() => {
      chamadas.push('insert-purchase-receipt');
      return {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 'recibo-3' } }),
        }),
      };
    });
    upsert.mockImplementation(() => {
      chamadas.push('upsert-entitlement');
      return {
        select: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: { id: 'entitlement-3' } }),
        }),
      };
    });
    const { registry } = makeValidatorsStub({
      valid: true,
      productId: 'pacote',
      expiresAt: null,
    });
    const service = new EntitlementsService(supabase, registry);

    await service.validate('user-1', 'stripe', 'sessao-stripe');

    expect(chamadas).toEqual(['insert-purchase-receipt', 'upsert-entitlement']);
  });

  it('mapeia platform para a origem correta em cada chamada', async () => {
    const { supabase, insert } = makeSupabaseStub({
      purchaseReceiptRow: { id: 'r' },
      entitlementRow: null,
    });
    const { registry } = makeValidatorsStub({ valid: false });
    const service = new EntitlementsService(supabase, registry);

    await service.validate('user-1', 'stripe', 'x');

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ origem: 'stripe' }),
    );
  });
});
