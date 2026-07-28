import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../lib/supabase', () => supabaseMocks);

describe('validarEntitlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('rejeita sem sessão ativa, sem chamar a API', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue(null);
    const { validarEntitlement } = await import('./entitlements');

    await expect(validarEntitlement('ios', 'receipt-abc')).rejects.toThrow('Sessão expirada');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('chama POST /entitlements/validate com Bearer token e corpo correto, retorna o JSON', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-abc');
    const resposta = { valid: true, product_id: 'plano_anual', expires_at: null };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => resposta,
    } as Response);
    const { validarEntitlement } = await import('./entitlements');

    const resultado = await validarEntitlement('ios', 'receipt-abc');

    expect(resultado).toEqual(resposta);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain('/entitlements/validate');
    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
    expect(JSON.parse(init?.body as string)).toEqual({ platform: 'ios', receipt: 'receipt-abc' });
  });

  it('lança erro quando a resposta não é ok (ex.: 401)', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-abc');
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    const { validarEntitlement } = await import('./entitlements');

    await expect(validarEntitlement('ios', 'receipt-abc')).rejects.toThrow('401');
  });

  it('lança erro de rede quando fetch rejeita', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-abc');
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));
    const { validarEntitlement } = await import('./entitlements');

    await expect(validarEntitlement('ios', 'receipt-abc')).rejects.toThrow('network down');
  });
});
