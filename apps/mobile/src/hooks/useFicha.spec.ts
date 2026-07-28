import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocalDiaryEventRow } from '../storage/schema';

const storageMocks = vi.hoisted(() => ({
  getAllEvents: vi.fn(),
}));

vi.mock('../storage/sqlite', () => storageMocks);

function makeRow(overrides: Partial<LocalDiaryEventRow> = {}): LocalDiaryEventRow {
  return {
    idLocal: 'local-1',
    serverId: null,
    campaignInstanceId: 'campaign-1',
    tipo: 'juramento_declarado',
    payload: { diasPorSemana: 3 },
    payloadCifrado: false,
    deviceId: 'device-1',
    idempotencyKey: 'idem-1',
    appVersion: '0.0.1',
    ocorridoEm: '2026-07-27T10:00:00.000Z',
    syncedAt: null,
    ...overrides,
  };
}

describe('useFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sem campanha ativa, devolve ficha inicial sem chamar storage', async () => {
    const { renderHook } = await import('../testUtils/renderHook');
    const { useFicha } = await import('./useFicha');

    const { result } = renderHook(() => useFicha(null), {});

    expect(storageMocks.getAllEvents).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.ficha.juramento).toBeNull();
  });

  it('carrega eventos da campanha e projeta a ficha via calcularFicha', async () => {
    storageMocks.getAllEvents.mockResolvedValue([makeRow()]);
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useFicha } = await import('./useFicha');

    const { result } = renderHook(() => useFicha('campaign-1'), {});
    await act(async () => {
      await Promise.resolve();
    });

    expect(storageMocks.getAllEvents).toHaveBeenCalledWith('campaign-1');
    expect(result.current.loading).toBe(false);
    expect(result.current.ficha.juramento).toEqual({
      diasPorSemana: 3,
      dataInicio: new Date('2026-07-27T10:00:00.000Z'),
      dataFim: new Date('2026-07-27T10:00:00.000Z'),
    });
  });

  it('erro no storage é exposto em `error`, não propagado sem tratamento', async () => {
    storageMocks.getAllEvents.mockRejectedValue(new Error('disco cheio'));
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useFicha } = await import('./useFicha');

    const { result } = renderHook(() => useFicha('campaign-1'), {});
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error?.message).toBe('disco cheio');
    expect(result.current.loading).toBe(false);
  });
});
