import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMocks = vi.hoisted(() => ({
  insertEvent: vi.fn(),
}));
const idsMocks = vi.hoisted(() => ({
  newId: vi.fn(() => 'generated-id'),
  getDeviceId: vi.fn(async () => 'device-abc'),
}));

vi.mock('../storage/sqlite', () => storageMocks);
vi.mock('../lib/ids', () => idsMocks);
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '0.0.1' } } }));

describe('useJuramento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.newId.mockReturnValue('generated-id');
    idsMocks.getDeviceId.mockResolvedValue('device-abc');
  });

  it('RF-004: dias fora de 1..6 rejeita sem gravar evento', async () => {
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useJuramento } = await import('./useJuramento');

    const { result } = renderHook(() => useJuramento('campaign-1'), {});

    await expect(
      act(async () => {
        await result.current.declararJuramento(7);
      }),
    ).rejects.toThrow(/RF-004/);
    expect(storageMocks.insertEvent).not.toHaveBeenCalled();
  });

  it('dias válidos grava juramento_declarado com o payload correto', async () => {
    storageMocks.insertEvent.mockResolvedValue(undefined);
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useJuramento } = await import('./useJuramento');

    const { result } = renderHook(() => useJuramento('campaign-1'), {});
    await act(async () => {
      await result.current.declararJuramento(3);
    });

    expect(storageMocks.insertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignInstanceId: 'campaign-1',
        tipo: 'juramento_declarado',
        payload: { diasPorSemana: 3 },
        deviceId: 'device-abc',
        appVersion: '0.0.1',
      }),
    );
  });

  it('falha do storage propaga e fica exposta em `error`', async () => {
    storageMocks.insertEvent.mockRejectedValue(new Error('disco cheio'));
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useJuramento } = await import('./useJuramento');

    const { result } = renderHook(() => useJuramento('campaign-1'), {});
    let caught: unknown;
    await act(async () => {
      try {
        await result.current.declararJuramento(3);
      } catch (err) {
        caught = err;
      }
    });
    expect((caught as Error).message).toBe('disco cheio');
    expect(result.current.error?.message).toBe('disco cheio');
  });
});
