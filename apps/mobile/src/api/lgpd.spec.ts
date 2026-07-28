import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../lib/supabase', () => supabaseMocks);

describe('exportarDadosLGPD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('rejeita sem sessão ativa, sem chamar a API', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue(null);
    const { exportarDadosLGPD } = await import('./lgpd');

    await expect(exportarDadosLGPD()).rejects.toThrow('Sessão expirada');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('chama GET /data-export com o Bearer token e retorna o JSON', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-abc');
    const dados = { eventos: [] };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => dados,
    } as Response);
    const { exportarDadosLGPD } = await import('./lgpd');

    const resultado = await exportarDadosLGPD();

    expect(resultado).toEqual(dados);
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
  });

  it('lança erro quando a resposta não é ok', async () => {
    supabaseMocks.getAccessToken.mockResolvedValue('token-abc');
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
    const { exportarDadosLGPD } = await import('./lgpd');

    await expect(exportarDadosLGPD()).rejects.toThrow('401');
  });
});
