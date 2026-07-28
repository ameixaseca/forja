import { beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeRow {
  id_local: string;
  server_id: number | null;
  campaign_instance_id: string;
  tipo: string;
  payload: string;
  payload_cifrado: number;
  device_id: string;
  idempotency_key: string;
  app_version: string;
  ocorrido_em: string;
  synced_at: string | null;
}

function createFakeDb() {
  const rows: FakeRow[] = [];

  return {
    execAsync: vi.fn(async () => {}),
    runAsync: vi.fn(async (sql: string, params: unknown[] = []) => {
      // `insertEvent` (9 params, sem server_id/synced_at) e `insertRemoteEvent`
      // (11 params) usam ambos `INSERT OR IGNORE` — mesma semântica de
      // dedupe por (campaign_instance_id, idempotency_key) que a constraint
      // única real da tabela (ver sqlite.ts).
      if (sql.startsWith('INSERT OR IGNORE INTO diary_events') && params.length === 9) {
        const [
          id_local,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
        ] = params as [string, string, string, string, number, string, string, string, string];
        if (
          rows.some(
            (r) =>
              r.campaign_instance_id === campaign_instance_id &&
              r.idempotency_key === idempotency_key,
          )
        )
          return;
        rows.push({
          id_local,
          server_id: null,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
          synced_at: null,
        });
        return;
      }
      if (sql.startsWith('UPDATE diary_events SET synced_at')) {
        const [syncedAt, serverId, idLocal] = params as [string, number, string];
        const row = rows.find((r) => r.id_local === idLocal);
        if (row) {
          row.synced_at = syncedAt;
          row.server_id = serverId;
        }
        return;
      }
      if (sql.startsWith('INSERT OR IGNORE INTO diary_events') && params.length === 11) {
        const [
          id_local,
          server_id,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
          synced_at,
        ] = params as [
          string,
          number | null,
          string,
          string,
          string,
          number,
          string,
          string,
          string,
          string,
          string,
        ];
        if (
          rows.some(
            (r) =>
              r.campaign_instance_id === campaign_instance_id &&
              r.idempotency_key === idempotency_key,
          )
        )
          return;
        rows.push({
          id_local,
          server_id,
          campaign_instance_id,
          tipo,
          payload,
          payload_cifrado,
          device_id,
          idempotency_key,
          app_version,
          ocorrido_em,
          synced_at,
        });
        return;
      }
      throw new Error(`unmapped SQL in fake db: ${sql}`);
    }),
    getAllAsync: vi.fn(async (sql: string, params: unknown[] = []) => {
      const [campaignInstanceId] = params as [string];
      if (sql.includes('synced_at IS NULL')) {
        return rows.filter(
          (r) => r.campaign_instance_id === campaignInstanceId && r.synced_at === null,
        );
      }
      return rows.filter((r) => r.campaign_instance_id === campaignInstanceId);
    }),
    withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
    __reset: () => {
      rows.length = 0;
    },
  };
}

const fakeDb = createFakeDb();

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(async () => fakeDb),
}));

describe('storage/sqlite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeDb.__reset();
  });

  it('inserts and reads back an event for its campaign instance', async () => {
    const { initDB, insertEvent, getAllEvents } = await import('./sqlite');
    await initDB();

    await insertEvent({
      idLocal: 'local-1',
      campaignInstanceId: 'campaign-1',
      tipo: 'juramento_declarado',
      payload: { diasPorSemana: 3 },
      payloadCifrado: false,
      deviceId: 'device-1',
      idempotencyKey: 'idem-1',
      appVersion: '0.0.1',
      ocorridoEm: '2026-07-27T10:00:00.000Z',
    });

    const events = await getAllEvents('campaign-1');
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      idLocal: 'local-1',
      tipo: 'juramento_declarado',
      payload: { diasPorSemana: 3 },
      syncedAt: null,
    });
  });

  it('getUnsyncedEvents only returns events without synced_at', async () => {
    const { insertEvent, getUnsyncedEvents, markSynced } = await import('./sqlite');

    await insertEvent({
      idLocal: 'local-2',
      campaignInstanceId: 'campaign-1',
      tipo: 'sessao_registrada',
      payload: {},
      payloadCifrado: false,
      deviceId: 'device-1',
      idempotencyKey: 'idem-2',
      appVersion: '0.0.1',
      ocorridoEm: '2026-07-27T11:00:00.000Z',
    });

    let unsynced = await getUnsyncedEvents('campaign-1');
    expect(unsynced.map((e) => e.idLocal)).toContain('local-2');

    await markSynced([{ idLocal: 'local-2', serverId: 42 }]);

    unsynced = await getUnsyncedEvents('campaign-1');
    expect(unsynced.map((e) => e.idLocal)).not.toContain('local-2');
  });

  it('does not duplicate an event re-inserted with the same idempotency key', async () => {
    const { insertEvent, getAllEvents } = await import('./sqlite');

    const event = {
      idLocal: 'local-3',
      campaignInstanceId: 'campaign-2',
      tipo: 'sessao_registrada' as const,
      payload: {},
      payloadCifrado: false,
      deviceId: 'device-1',
      idempotencyKey: 'idem-3',
      appVersion: '0.0.1',
      ocorridoEm: '2026-07-27T12:00:00.000Z',
    };

    await insertEvent(event);
    await insertEvent({ ...event, idLocal: 'local-3-retry' });

    const events = await getAllEvents('campaign-2');
    expect(events).toHaveLength(1);
  });
});
