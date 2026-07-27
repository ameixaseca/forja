import { describe, it, expect } from 'vitest';
import { DataExportResponseSchema } from '../src/index';

function makeExport(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    diary_events: [],
    consent_events: [],
    profile: null,
    entitlements: [],
    purchase_receipts: [],
    ...overrides,
  };
}

describe('DataExportResponseSchema', () => {
  it('aceita export vazio de usuário sem conta paga', () => {
    const result = DataExportResponseSchema.safeParse(makeExport());
    expect(result.success).toBe(true);
  });

  it('aceita export completo com uma linha por coleção', () => {
    const result = DataExportResponseSchema.safeParse(
      makeExport({
        diary_events: [
          {
            id: 1,
            tipo: 'sessao_registrada',
            payload: { nota: 'ok' },
            payload_cifrado: false,
            device_id: 'device-1',
            app_version: '1.0.0',
            ocorrido_em: '2026-01-01T00:00:00.000Z',
            recebido_em: '2026-01-01T00:00:01.000Z',
          },
        ],
        consent_events: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            tipo: 'backup_nuvem',
            acao: 'concedido',
            politica_versao: '1.0',
            ocorrido_em: '2026-01-01T00:00:00.000Z',
          },
        ],
        profile: {
          id: '22222222-2222-2222-2222-222222222222',
          faixa_etaria_confirmada_em: '2026-01-01T00:00:00.000Z',
          idioma: 'pt-BR',
          criado_em: '2026-01-01T00:00:00.000Z',
          atualizado_em: '2026-01-01T00:00:00.000Z',
        },
        entitlements: [
          {
            id: '33333333-3333-3333-3333-333333333333',
            pacote: 'forja_campaign_espinha',
            origem: 'app_store',
            status: 'ativo',
            valido_ate: null,
            transacao_externa_id: 'txn-1',
            criado_em: '2026-01-01T00:00:00.000Z',
            atualizado_em: '2026-01-01T00:00:00.000Z',
          },
        ],
        purchase_receipts: [
          {
            id: '44444444-4444-4444-4444-444444444444',
            origem: 'app_store',
            payload_bruto: { raw: 'recibo' },
            status_verificacao: 'valido',
            verificado_em: '2026-01-01T00:00:00.000Z',
            entitlement_id: '33333333-3333-3333-3333-333333333333',
            criado_em: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('rejeita quando falta uma coleção obrigatória', () => {
    const { diary_events: _omitted, ...rest } = makeExport();
    const result = DataExportResponseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejeita entitlement com origem que não é string', () => {
    const result = DataExportResponseSchema.safeParse(
      makeExport({
        entitlements: [
          {
            id: '33333333-3333-3333-3333-333333333333',
            pacote: 'x',
            origem: 123,
            status: 'ativo',
            valido_ate: null,
            transacao_externa_id: null,
            criado_em: '2026-01-01T00:00:00.000Z',
            atualizado_em: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });
});
