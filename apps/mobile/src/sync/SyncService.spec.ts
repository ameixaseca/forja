import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocalDiaryEventRow } from '../storage/schema';

const storageMocks = vi.hoisted(() => ({
  getAllEvents: vi.fn(),
  getUnsyncedEvents: vi.fn(),
  insertRemoteEvent: vi.fn(),
  markSynced: vi.fn(),
}));

vi.mock('../storage/sqlite', () => storageMocks);

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

function makeSupabaseMock() {
  const insertSelect = vi.fn();
  const insertSingle = vi.fn();
  const selectSingle = vi.fn();
  const selectChain = {
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    order: vi.fn(),
    single: selectSingle,
  };

  const from = vi.fn(() => ({
    insert: vi.fn((payload: unknown) => {
      if (Array.isArray(payload)) {
        return { select: insertSelect };
      }
      return { select: vi.fn(() => ({ single: insertSingle })) };
    }),
    select: vi.fn(() => selectChain),
  }));

  return { from, insertSelect, insertSingle, selectChain, selectSingle };
}

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('push: envia eventos pendentes e marca synced com o server id retornado', async () => {
    const { SyncService } = await import('./SyncService');
    const { from, insertSelect, selectChain } = makeSupabaseMock();
    storageMocks.getUnsyncedEvents.mockResolvedValue([makeRow()]);
    insertSelect.mockResolvedValue({
      data: [{ id: 100, idempotency_key: 'idem-1' }],
      error: null,
    });
    selectChain.order.mockResolvedValue({ data: [], error: null });
    storageMocks.getAllEvents.mockResolvedValue([]);

    const service = new SyncService({ from } as never, 'user-1');
    const result = await service.push('campaign-1');

    expect(result).toEqual({ pushed: 1, alreadySynced: 0 });
    expect(storageMocks.markSynced).toHaveBeenCalledWith([{ idLocal: 'local-1', serverId: 100 }]);
  });

  it('push: reenvio de evento já sincronizado (duplicate idempotency_key) busca o server_id real e conta como sucesso', async () => {
    const { SyncService } = await import('./SyncService');
    const { from, insertSelect, insertSingle, selectSingle } = makeSupabaseMock();
    storageMocks.getUnsyncedEvents.mockResolvedValue([makeRow()]);
    insertSelect.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key' },
    });
    insertSingle.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key' },
    });
    selectSingle.mockResolvedValue({ data: { id: 100 }, error: null });

    const service = new SyncService({ from } as never, 'user-1');
    const result = await service.push('campaign-1');

    expect(result).toEqual({ pushed: 0, alreadySynced: 1 });
    // server_id real é buscado, não gravado como null — evita que pull()
    // recalcule lastServerId incorretamente e refetch o evento pra sempre.
    expect(storageMocks.markSynced).toHaveBeenCalledWith([{ idLocal: 'local-1', serverId: 100 }]);
  });

  it('push: erro de rede não marca nenhum evento como sincronizado', async () => {
    const { SyncService } = await import('./SyncService');
    const { from, insertSelect } = makeSupabaseMock();
    storageMocks.getUnsyncedEvents.mockResolvedValue([makeRow()]);
    insertSelect.mockResolvedValue({
      data: null,
      error: { code: 'ETIMEDOUT', message: 'network error' },
    });

    const service = new SyncService({ from } as never, 'user-1');

    await expect(service.push('campaign-1')).rejects.toBeTruthy();
    expect(storageMocks.markSynced).not.toHaveBeenCalled();
  });

  it('pull: usa o maior server_id local (ignorando eventos ainda não sincronizados) como cursor', async () => {
    const { SyncService } = await import('./SyncService');
    const { from, selectChain } = makeSupabaseMock();
    // Mistura eventos sem server_id (ainda não sincronizados por este
    // device) com server_ids fora de ordem — o maior deve vencer, e
    // `null` nunca deve ser tratado como "maior que 10".
    storageMocks.getAllEvents.mockResolvedValue([
      makeRow({ idLocal: 'local-1', serverId: 10 }),
      makeRow({ idLocal: 'local-2', serverId: null }),
      makeRow({ idLocal: 'local-3', serverId: 7 }),
    ]);
    selectChain.order.mockResolvedValue({
      data: [
        {
          id: 11,
          campaign_instance_id: 'campaign-1',
          tipo: 'sessao_registrada',
          payload: {},
          payload_cifrado: false,
          device_id: 'device-2',
          idempotency_key: 'idem-remote-1',
          app_version: '0.0.1',
          ocorrido_em: '2026-07-27T12:00:00.000Z',
        },
      ],
      error: null,
    });

    const service = new SyncService({ from } as never, 'user-1');
    const result = await service.pull('campaign-1');

    expect(from).toHaveBeenCalledWith('diary_events');
    expect(selectChain.eq).toHaveBeenCalledWith('campaign_instance_id', 'campaign-1');
    expect(selectChain.gt).toHaveBeenCalledWith('id', 10);
    expect(selectChain.order).toHaveBeenCalledWith('id', { ascending: true });
    expect(result).toEqual({ pulled: 1 });
    expect(storageMocks.insertRemoteEvent).toHaveBeenCalledWith(
      expect.objectContaining({ idLocal: 'remote-11', serverId: 11 }),
    );
  });

  it('pull: sem eventos locais ainda, usa 0 como cursor (traz tudo)', async () => {
    const { SyncService } = await import('./SyncService');
    const { from, selectChain } = makeSupabaseMock();
    storageMocks.getAllEvents.mockResolvedValue([]);
    selectChain.order.mockResolvedValue({ data: [], error: null });

    const service = new SyncService({ from } as never, 'user-1');
    await service.pull('campaign-1');

    expect(selectChain.gt).toHaveBeenCalledWith('id', 0);
  });

  it('pull: propaga erro do Supabase sem inserir nada localmente', async () => {
    const { SyncService } = await import('./SyncService');
    const { from, selectChain } = makeSupabaseMock();
    storageMocks.getAllEvents.mockResolvedValue([]);
    selectChain.order.mockResolvedValue({
      data: null,
      error: { code: 'ETIMEDOUT', message: 'network error' },
    });

    const service = new SyncService({ from } as never, 'user-1');

    await expect(service.pull('campaign-1')).rejects.toBeTruthy();
    expect(storageMocks.insertRemoteEvent).not.toHaveBeenCalled();
  });
});
