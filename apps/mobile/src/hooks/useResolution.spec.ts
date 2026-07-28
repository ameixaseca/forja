import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Catalog } from '@forja/motor-narrativo';
import type { LocalDiaryEventRow } from '../storage/schema';

const storageMocks = vi.hoisted(() => ({
  getAllEvents: vi.fn(),
  insertEvent: vi.fn(),
}));
const idsMocks = vi.hoisted(() => ({
  newId: vi.fn(() => 'generated-id'),
  getDeviceId: vi.fn(async () => 'device-abc'),
}));

vi.mock('../storage/sqlite', () => storageMocks);
vi.mock('../lib/ids', () => idsMocks);
vi.mock('../lib/dados', () => ({ rolar2d6: () => 7 }));
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '0.0.1' } } }));

const catalog: Catalog = {
  storylets: [
    {
      id: 'st_cor_fallback',
      banda: 'Cor',
      subclasse: null,
      variantes: [{ texto: 'texto.cor.fallback', efeitos: { 'cap.aberto': true } }],
    },
  ],
};

function makeRow(overrides: Partial<LocalDiaryEventRow> = {}): LocalDiaryEventRow {
  return {
    idLocal: 'local-1',
    serverId: null,
    campaignInstanceId: 'campaign-1',
    tipo: 'sessao_registrada',
    payload: {},
    payloadCifrado: false,
    deviceId: 'device-1',
    idempotencyKey: 'idem-1',
    appVersion: '0.0.1',
    ocorridoEm: '2026-07-27T10:00:00.000Z',
    syncedAt: null,
    ...overrides,
  };
}

describe('useResolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idsMocks.newId.mockReturnValue('generated-id');
    idsMocks.getDeviceId.mockResolvedValue('device-abc');
    storageMocks.getAllEvents.mockResolvedValue([]);
    storageMocks.insertEvent.mockResolvedValue(undefined);
  });

  it('resolve() é chamado sobre a ficha/estado corrente e o resultado é gravado como sessao_registrada', async () => {
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useResolution } = await import('./useResolution');

    const { result } = renderHook(() => useResolution('campaign-1', catalog), {});
    await act(async () => {
      await Promise.resolve();
    });

    let resolucao;
    await act(async () => {
      resolucao = await result.current.registrarSessao();
    });

    expect(resolucao).toMatchObject({ storylet: { id: 'st_cor_fallback' } });
    expect(storageMocks.insertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idLocal: 'generated-id',
        campaignInstanceId: 'campaign-1',
        tipo: 'sessao_registrada',
        payloadCifrado: false,
        deviceId: 'device-abc',
        idempotencyKey: 'generated-id',
        appVersion: '0.0.1',
        payload: expect.objectContaining({
          storyletId: 'st_cor_fallback',
          qualities: expect.objectContaining({ 'cap.aberto': true }),
        }),
      }),
    );
    expect(result.current.ultimoResultado?.storylet.id).toBe('st_cor_fallback');
    // refresh() recarrega o log local após gravar (getAllEvents chamada de novo)
    expect(storageMocks.getAllEvents).toHaveBeenCalledTimes(2);
  });

  it('inputsOverride sobrescreve os defaults simplificados de MVP (ex.: reencontro)', async () => {
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useResolution } = await import('./useResolution');

    const { result } = renderHook(() => useResolution('campaign-1', catalog), {});
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.registrarSessao({ reencontro: true });
    });

    const [[eventoGravado]] = storageMocks.insertEvent.mock.calls;
    expect(eventoGravado.tipo).toBe('sessao_registrada');
  });

  it('estado narrativo é reconstruído a partir do último sessao_registrada gravado no log', async () => {
    storageMocks.getAllEvents.mockResolvedValue([
      makeRow({ payload: { qualities: { 'mem.andou_sozinho': true } } }),
    ]);
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useResolution } = await import('./useResolution');

    const { result } = renderHook(() => useResolution('campaign-1', catalog), {});
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.registrarSessao();
    });

    const [[eventoGravado]] = storageMocks.insertEvent.mock.calls;
    // efeitos do storylet fallback se acumulam sobre o state anterior (mem.andou_sozinho)
    expect(eventoGravado.payload.qualities).toMatchObject({
      'mem.andou_sozinho': true,
      'cap.aberto': true,
    });
  });

  it('falha ao gravar propaga e fica exposta em `error`', async () => {
    storageMocks.insertEvent.mockRejectedValue(new Error('disco cheio'));
    const { renderHook, act } = await import('../testUtils/renderHook');
    const { useResolution } = await import('./useResolution');

    const { result } = renderHook(() => useResolution('campaign-1', catalog), {});
    await act(async () => {
      await Promise.resolve();
    });

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.registrarSessao();
      } catch (err) {
        caught = err;
      }
    });
    expect((caught as Error).message).toBe('disco cheio');
    expect(result.current.error?.message).toBe('disco cheio');
  });
});
