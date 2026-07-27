import { describe, it, expect } from 'vitest';
import { EntitlementValidateRequestSchema, EntitlementValidateResponseSchema } from '../src/index';

describe('EntitlementValidateRequestSchema', () => {
  it('aceita platform/receipt válidos para cada origem suportada', () => {
    for (const platform of ['ios', 'android', 'stripe'] as const) {
      const result = EntitlementValidateRequestSchema.safeParse({ platform, receipt: 'recibo-base64' });
      expect(result.success).toBe(true);
    }
  });

  it('rejeita platform fora do enum suportado', () => {
    const result = EntitlementValidateRequestSchema.safeParse({ platform: 'web', receipt: 'x' });
    expect(result.success).toBe(false);
  });

  it('rejeita receipt vazio', () => {
    const result = EntitlementValidateRequestSchema.safeParse({ platform: 'ios', receipt: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita request sem receipt', () => {
    const result = EntitlementValidateRequestSchema.safeParse({ platform: 'ios' });
    expect(result.success).toBe(false);
  });
});

describe('EntitlementValidateResponseSchema', () => {
  it('aceita resposta válida com expires_at nulo (perpétuo)', () => {
    const result = EntitlementValidateResponseSchema.safeParse({
      valid: true,
      product_id: 'forja_campaign_espinha',
      expires_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('aceita resposta de recibo inválido, sem product_id', () => {
    const result = EntitlementValidateResponseSchema.safeParse({ valid: false });
    expect(result.success).toBe(true);
  });

  it('rejeita expires_at que não é datetime ISO', () => {
    const result = EntitlementValidateResponseSchema.safeParse({ valid: true, expires_at: 'ontem' });
    expect(result.success).toBe(false);
  });
});
